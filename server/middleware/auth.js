import jwt from "jsonwebtoken";
import { User } from "../models/Schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "shopez_jwt_secret_key_12345";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.usertype === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin privileges required" });
  }
};
