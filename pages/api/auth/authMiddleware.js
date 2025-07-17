import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import express from "express";

const app = express();
app.use(cookieParser());

export function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return res.status(403).json({ message: "Invalid token." });
  }
}
