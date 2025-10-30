import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import uploadToCloudinary from "../../helper/uploadToCloudinary.js";
import Audio from "../../models/audio.model.js";
import deleteFromCloudinary from "../../helper/dleteFromCloudinary.js";



 
export const signup = async (req, res) => {
  try {
    const { username, name, email, password, gender} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image upload
    let profileImage = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: "profile_images",
      });
      profileImage = result.secure_url;
    }

    // Create new user
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      gender,
      profileImage,
   
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating account",
      error: error.message,
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

export const getAuthenticatedUser = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch the full user info from DB
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "savedAudios.audioId",
        model: "Audio",
        select: "title thumbnailUrl",
      })
      .populate({
        path: "likedAudios.audioId",
        model: "Audio",
        select: "title thumbnailUrl author profileImage",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getAuthenticatedUser error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching authenticated user",
      error: error.message,
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;  
    const { id } = req.params;
    const { username, name, email, password, gender } = req.body;
    const { profileImage } = req.files || {};

    // Only allow logged-in user to update their own account
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own account.",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedData = {};

    // Username update with uniqueness check
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken." });
      }
      updatedData.username = username.trim();
    }

    // Email update with uniqueness check
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered." });
      }
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter a valid email." });
      }
      updatedData.email = email.trim();
    }

    if (name) updatedData.name = name.trim();
    if (gender) updatedData.gender = gender.trim();

    // Password update with hashing
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters.",
          });
      }
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    // Profile image update
    if (profileImage) {
      if (user.profileImage) {
        await deleteFromCloudinary(user.profileImage, "image");
      }
      const result = await uploadToCloudinary(profileImage[0].path, {
        folder: "profile_images",
      });
      updatedData.profileImage = result.secure_url;
    }

    // No fields to update
    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No valid fields provided to update.",
        });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password -savedAudios -likedAudios");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        gender: updatedUser.gender,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating user",
        error: error.message,
      });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Only allow logged-in user to delete their own account
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own account.",
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Delete profile image
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage, "image");
    }

    // Delete user's audios and their files
    const userAudios = await Audio.find({ author: id });
    for (const audio of userAudios) {
      if (audio.thumbnailUrl)
        await deleteFromCloudinary(audio.thumbnailUrl, "image");
      if (audio.audioUrl) await deleteFromCloudinary(audio.audioUrl, "video");
    }
    await Audio.deleteMany({ author: id });

    // Remove user's audios from saved/liked lists of other users
    await User.updateMany(
      { "savedAudios.audioId": { $in: userAudios.map((a) => a._id) } },
      {
        $pull: {
          savedAudios: { audioId: { $in: userAudios.map((a) => a._id) } },
        },
      }
    );
    await User.updateMany(
      { "likedAudios.audioId": { $in: userAudios.map((a) => a._id) } },
      {
        $pull: {
          likedAudios: { audioId: { $in: userAudios.map((a) => a._id) } },
        },
      }
    );

    // Delete user
    await User.findByIdAndDelete(id);

    // Clear JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json({
        success: true,
        message: "User account and associated data deleted successfully.",
      });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting user account",
        error: error.message,
      });
  }
};