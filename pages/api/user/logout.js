import { serialize as serializeCookie } from "cookie";
import dbConnect from "../../../lib/dbConnect";
import Session from "../../../models/Session";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log("req.user:", req.user);
    if (req.user) {
      await Session.deleteMany({ userId: req.user.id });
    }

    const cookies = [
      serializeCookie("authToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        expires: new Date(0),
        sameSite: "strict",
        path: "/",
      }),
      serializeCookie("next-auth.session-token", "", {
        path: "/",
        expires: new Date(0),
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
      }),
      serializeCookie("csrf-token", "", {
        path: "/",
        expires: new Date(0),
      }),
    ];

    res.setHeader("Set-Cookie", cookies);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.redirect(302, "/login");
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء تسجيل الخروج",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
}
