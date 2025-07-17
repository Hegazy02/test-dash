// src/pages/api/user/login.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Session from "@/models/Session";
import bcrypt from "bcrypt";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { errorHandler } from "@/lib/errorHandler";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 يوم بالثواني
};

function generateFingerprintData(req) {
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();

  return {
    visitorId: crypto.randomBytes(10).toString("hex"),
    requestId: `${Date.now()}.${uuidv4().substr(0, 6)}`,
    browserName: ua.browser.name || "Unknown",
    browserVersion: ua.browser.version || "Unknown",
    device: ua.device.type || "Desktop",
    os: ua.os.name || "Unknown",
    osVersion: ua.os.version || "Unknown",
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    location: {
      city: "Unknown",
      country: "Unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    userAgent: req.headers["user-agent"] || "Unknown",
  };
}

const getExpiryDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export default async function login(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "كلمة المرور غير صحيحة" });
    }

    const fingerprint = generateFingerprintData(req);

    const activeSessions = await Session.find({
      userId: user._id,
      expires: { $gt: new Date() },
    });

    if (activeSessions.length >= 4) {
      const matchingSession = activeSessions.find(
        (session) =>
          session.fingerprint.visitorId === fingerprint.visitorId &&
          session.fingerprint.ip === fingerprint.ip &&
          session.fingerprint.userAgent === fingerprint.userAgent,
      );

      if (!matchingSession) {
        return res.status(409).json({
          error: "تم تسجيل الدخول من جهاز آخر. الرجاء الخروج منه أولاً.",
        });
      }

      matchingSession.expires = getExpiryDate(5);
      await matchingSession.save();

      const authCookie = serialize(
        "authToken",
        matchingSession.sessionToken,
        cookieOptions,
      );
      res.setHeader("Set-Cookie", authCookie);

      return res.status(200).json({
        message: "تم تجديد الجلسة بنجاح",
        user: safeUser,
        sessionId: matchingSession._id,
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        id: user.id,
        role: user.role,
        fingerprint: {
          visitorId: fingerprint.visitorId,
          device: fingerprint.device,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    const newSession = await Session.create({
      sessionToken: token,
      userId: user.id,
      expires: getExpiryDate(5),
      fingerprint: {
        ...fingerprint,
        location: {
          city: fingerprint.location.city,
          country: fingerprint.location.country,
          timezone: fingerprint.location.timezone,
        },
      },
      activityLog: [
        {
          timestamp: new Date(),
          type: "login",
          ip: fingerprint.ip,
        },
      ],
    });

    const authCookie = serialize("authToken", token, cookieOptions);
    res.setHeader("Set-Cookie", authCookie);

    const { password: _, ...safeUser } = user.toObject();

    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: safeUser,
      sessionId: newSession._id,
      deviceInfo: {
        browser: fingerprint.browserName,
        os: fingerprint.os,
        location: fingerprint.location,
      },
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}
