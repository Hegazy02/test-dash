"use server";
import dbConnect from "../../../lib/dbConnect.js";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
let uniqueID;
export default async function signup(req, res) {
  await dbConnect();

  async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  if (req.method === "POST") {
    const {
      email,
      password,
      Username,
      firstName,
      lastName,
      PhoneNumber,
      IsAdmin,
    } = req.body;

    const isGoogleSignUp = !password;

    if (isGoogleSignUp) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(200).json({ message: "User already exists" });
      }
    } else {
      uniqueID = uuidv4();
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (
        password.length < 8 ||
        !hasUpperCase ||
        !hasLowerCase ||
        !hasNumbers ||
        !hasSpecialChars
      ) {
        return res.status(400).json({
          error:
            "Password must be more than 8 characters, contain uppercase and lowercase letters, numbers, and symbols.",
        });
      }
      const existing1User = await User.findOne({ email: email });
      if (existing1User) {
        return res.status(400).json({ error: "This email is already in use." });
      }
      const existing2User = await User.findOne({ username: Username });
      if (existing2User) {
        return res
          .status(400)
          .json({ error: "This username is already in use." });
      }
    }

    try {
      const hashed_Password = isGoogleSignUp
        ? null
        : await hashPassword(password);

      await User.findOneAndUpdate(
        { email: email.toString() },
        {
          $set: {
            password: hashed_Password,
            id: uniqueID,
            username: Username,
            firstName: firstName,
            lastName: lastName,
            PhoneNumber: PhoneNumber,
            IsAdmin: IsAdmin ? IsAdmin : "false",
          },
        },
        { upsert: true, new: true },
      );

      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Error creating user" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
