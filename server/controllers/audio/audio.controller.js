import Audio from "../../models/audio.model.js";
import User from "../../models/user.model.js";
import Comment from "../../models/comment.model.js"
import uploadToCloudinary from "../../helper/uploadToCloudinary.js";
import mongoose from "mongoose";

export const uploadAudio = async (req, res) => {
  try {
    const { title, category, description, tags } = req.body;

    const authorId = req.user?.userId; // Comes from auth middleware
    const { thumbnailImage, audioFile } = req.files || {};

    // Ensure user is authenticated
    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    // Validate required files
    if (!thumbnailImage && !audioFile) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail and audio files are required",
      });
    }

    // Upload files concurrently to Cloudinary
    const [thumbnailUpload, audioUpload] = await Promise.all([
      uploadToCloudinary(thumbnailImage[0].path, {
        folder: "audio-thumbnails",
      }),
      uploadToCloudinary(audioFile[0].path, {
        folder: "audio-files",
        resource_type: "video", // audio files often need resource_type: "video"
      }),
    ]);

  
    const newAudio = new Audio({
      author: authorId,
      title,
      description,
      category,
      thumbnailUrl: thumbnailUpload.secure_url,
      audioUrl: audioUpload.secure_url,
      tags,
      duration: audioUpload.duration,
    });

    await newAudio.save();

    res.status(201).json({
      success: true,
      message: "Audio uploaded successfully",
      audio: newAudio,
    });
  } catch (error) {
    console.error("Upload audio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload audio",
      error: error.message,
    });
  }
};

export const getAudioById = async (req, res) => {
  try {
    const { audioId } = req.params;

    // Find audio and populate author and comments with their authors
    const audio = await Audio.findById(audioId)
      .populate("author", "name profileImage")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name profileImage",
        },
        options: { sort: { createdAt: -1 } }, // Optional: Sort comments by newest first
      });

    if (!audio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Audio successfully fetched",
      audio,
    });
  } catch (error) {
    console.error("Error fetching audio by ID:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAudio = async (req, res) => {
  try {
    let {
      firstQueryTime,
      page = 1,
      limit = 6,
      author,
      category,
      search,
      sort,
    } = req.query;

    // Convert page and limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // If it's the first request, set the query time to the current timestamp
    if (!firstQueryTime) {
      firstQueryTime = new Date().toISOString();
    }

    // Base query: Fetch videos created before or at the first query time to ensure consistency
    const query = { createdAt: { $lte: new Date(firstQueryTime) } };

    // Filter by author if provided
    if (author) {
      query.author = author;
    }

    // Filter by category if provided
    if (category) {
      query.category = category; // Ensure category matches exactly
    }

    // Search functionality across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // Search in title (case-insensitive)
        { description: { $regex: search, $options: "i" } }, // Search in description
        { category: { $regex: search, $options: "i" } }, // Search in category
        { tags: { $in: [new RegExp(search, "i")] } }, // Search in tags (array)
      ];
    }

    // Sorting logic: Default to latest videos
    let sortOptions = { createdAt: -1 };
    if (sort === "popularity") {
      sortOptions = { viewCount: -1 }; // Sort by most viewed if 'popular' is selected
    }

    // Count total matching videos for pagination
    const totalAudios = await Audio.countDocuments(query);
    const totalPages = Math.ceil(totalAudios / limit);

    // Fetch videos with pagination and sorting
    const audios = await Audio.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit) // Skip items for pagination
      .limit(limit) // Limit results per page
      .populate("author", "name  profileImage"); // Populate author details

    return res.status(200).json({
      success: true,
      message: "Audios fetched successfully",
      firstQueryTime, // Keep track of initial fetch time for consistency
      page,
      limit,
      totalPages,
      totalAudios,
      audios,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleLikeAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const authenticatedUserId = req.user?.userId;
    console.log("user id authenticatedUserId", authenticatedUserId);

    // Validate authentication
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to like or unlike audio.",
      });
    }

    // Validate audioId
    if (!mongoose.isValidObjectId(audioId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audio ID.",
      });
    }

    // Check if audio exists
    const existingAudio = await Audio.findById(audioId);
    if (!existingAudio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found.",
      });
    }

    // Check if user exists
    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Determine if the user has already liked the audio
    const userHasAlreadyLiked = existingAudio.likes.some(
      (id) => id.toString() === authenticatedUserId.toString()
    );

    // Update Audio's likes array
    const updateLikesAction = userHasAlreadyLiked
      ? { $pull: { likes: authenticatedUserId } } // Unlike
      : { $addToSet: { likes: authenticatedUserId } }; // Like

    const updatedAudioDocument = await Audio.findByIdAndUpdate(
      audioId,
      updateLikesAction,
      { new: true }
    ).populate("author", "name profileImage");

    // Update User's likedAudios array
    if (userHasAlreadyLiked) {
      // Remove from likedAudios
      await User.findByIdAndUpdate(
        authenticatedUserId,
        { $pull: { likedAudios: { audioId } } },
        { new: true }
      );
    } else {
      // Add to likedAudios with audioId and likedAt
      await User.findByIdAndUpdate(
        authenticatedUserId,
        {
          $addToSet: {
            likedAudios: {
              audioId,
              likedAt: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    // Fetch updated user with populated likedAudios.audioId
    const updatedUser = await User.findById(authenticatedUserId).populate({
      path: "likedAudios.audioId",
      select: "title thumbnailUrl author",
      populate: {
        path: "author",
        select: "name profileImage",
      },
    });

    return res.status(200).json({
      success: true,
      message: userHasAlreadyLiked
        ? "Like removed from this audio."
        : "Audio successfully liked.",
      liked: !userHasAlreadyLiked,
      audioId,
      userId: authenticatedUserId,
      totalLikes: updatedAudioDocument.likes.length,
      user: updatedUser, // Return updated user to reflect likedAudios
    });
  } catch (error) {
    console.error("Error toggling like on audio:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the like status.",
      error: error.message,
    });
  }
};

export const toggleBookmarkAudio = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const { audioId } = req.params;
    console.log("targetAudioId:", audioId); // optional: rename this log too

    if (!authenticatedUserId) {
      return res.status(401).json({
        message: "Unauthorized: Please log in to save or unsave audios.",
      });
    }

    const audioToBookmark = await Audio.findById(audioId);
    if (!audioToBookmark) {
      return res.status(404).json({
        message: "Audio not found. It may have been deleted.",
      });
    }

    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        message: "User not found. Please re-login and try again.",
      });
    }

    const alreadyBookmarked = userDocument.savedAudios.some(
      (saved) => saved.audioId?.toString() === audioId
    );

    if (alreadyBookmarked) {
      // Remove bookmark
      userDocument.savedAudios = userDocument.savedAudios.filter(
        (saved) => saved.audioId?.toString() !== audioId
      );
    } else {
      // Add bookmark
      userDocument.savedAudios.push({ audioId });
    }

    await userDocument.save();

    const updatedUserWithBookmarks = await User.findById(
      authenticatedUserId
    ).populate("savedAudios.audioId");

    res.status(200).json({
      message: alreadyBookmarked
        ? "Audio removed from your saved list."
        : "Audio added to your saved list.",
      bookmarked: !alreadyBookmarked,
      user: updatedUserWithBookmarks,
      audioId, 
    });
  } catch (error) {
    console.error("Error toggling audio bookmark:", error.message);
    res.status(500).json({
      message: "Something went wrong while bookmarking the audio.",
      error: error.message,
    });
  }
};

export const updateAudioAsViewed = async (req, res) => {
  try {
    const { audioId } = req.params;
    const userId = req.user?.userId;

    // Check if the audio has already been viewed by the current user
    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found",
      });
    }

    const viewedByCurrentUser = audio.viewedBy.some(
      (view) => view.userId === userId
    );

    if (!viewedByCurrentUser) {
      // If the audio hasn't been viewed by the current user, update it as viewed
      await Audio.findByIdAndUpdate(
        audioId,
        {
          $addToSet: { viewedBy: { userId: userId } },
          $inc: { viewCount: 1 }, // Incrementing the viewCount
        },
        { new: true }
      ).populate("author", "name profileImage");

      // Return the updated audio

      return res.status(200).json({
        success: true,
        message: "Audio updated as viewed",
        audio,
      });
    } else {
      // If the audio has already been viewed by the current user, return a message
      return res.status(200).json({
        success: true,
        message: "Audio already viewed by the user",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCommentToAudio = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const audioId = req.params.audioId; // More descriptive than 'id'
    const { content } = req.body;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }

    // Validate comment content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content is required and must be a non-empty string",
      });
    }

    // Find the audio
    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found",
      });
    }

    // Create and save the comment
    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      audio: audioId, // Link comment to audio
    });

    await newComment.save();

    // Add comment to audio's comments array
    audio.comments = audio.comments || []; // Ensure comments array exists
    audio.comments.push(newComment._id);
    await audio.save();

    // Populate author details
    const populatedComment = await Comment.findById(newComment._id).populate(
      "author",
      "name profileImage" // Changed 'profilePic' to 'profileImage' for consistency
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment to audio:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment to audio",
      error: error.message,
    });
  }
};
