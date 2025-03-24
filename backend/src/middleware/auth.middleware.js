import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect_route = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is invalid" });
    }

    // Find user by ID stored in token
    const user = await User.findById(decoded.id || decoded.user_id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protect_route:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
