import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generate_token } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    if (!full_name || !email || !password) {
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

    const new_user = new User({
      full_name: full_name,
      email: email,
      password: hashedPassword,
    });

    if (new_user) {
      generate_token(new_user._id, res);
      await new_user.save();

      res.status(201).json({
        _id: new_user._id,
        full_name: new_user.full_name,
        email: new_user.email,
        profile_pic: new_user.profile_pic,
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
    generate_token(user._id, res);

    // Respond with user details
    res.status(200).json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      profile_pic: user.profile_pic,
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
