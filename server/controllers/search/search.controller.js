import Audio from "../../models/audio.model.js";

export const searchAllContent = async (req, res) => {
  try {
    const { q } = req.query; // Search keyword

    if (q) {
      const regex = { $regex: q, $options: "i" }; // Case-insensitive search
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
      ];
    }

    const results = await Audio.find(query)
      .populate("author", "name email")
      .populate("comments")
      .populate("likes", "name email")
      .populate("viewedBy.userId", "name email")
      .sort({ viewCount: -1, "likes.length": -1 })
      .lean();

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "No audio found matching the criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Audio content retrieved successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error searching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search audio content",
      error: error.message,
    });
  }
};
