import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const user = await User.findOne({ email });

    if (user)
      return res.status(400).json({
        message: "User already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invaild user data",
      });
    }
  } catch (error) {
    console.log("Error in signup", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const is_password_valid = await bcrypt.compare(password, user.password);

    if (!is_password_valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate and set token
    generateToken(user._id, res);

    // Respond with user details
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  try {
    // res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: true });
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch {
    console.log("Error in logout", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const user_id = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    try {
      const upload_response = await cloudinary.uploader.upload(profilePic);
      const updated_user = await User.findByIdAndUpdate(
        user_id,
        {
          profilePic: upload_response.secure_url,
        },
        { new: true }
      ).select("-password");

      res.status(200).json({
        _id: updated_user._id,
        fullName: updated_user.fullName,
        email: updated_user.email,
        profilePic: updated_user.profilePic,
      });
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      return res.status(500).json({ message: "Error uploading image" });
    }
  } catch (error) {
    console.log("Error in updateProfile", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export const check_auth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in check_auth", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};
