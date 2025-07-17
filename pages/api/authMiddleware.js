// middleware/authMiddleware.js
import { NextResponse } from "next/server";
import helmet from "helmet";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookie from "cookie";

// إعدادات Helmet لحماية الرأس
const helmetMiddleware = helmet();

// إعدادات XSS Clean لتنظيف المدخلات
const xssCleanMiddleware = xssClean();

// إعدادات Mongo Sanitize لمنع NoSQL Injection
const mongoSanitizeMiddleware = mongoSanitize();

// إعدادات Rate Limit للحماية من DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: { error: "تجاوزت الحد المسموح للطلبات، حاول لاحقًا." },
});

// إعدادات CSRF
const csrfProtection = csrf({ cookie: { secure: true, httpOnly: true } });

// إعدادات CORS
const allowedOrigins = [
  "https://hotel1-git-master-samiadham12s-projects.vercel.app/",
  "http://localhost:3000",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("غير مسموح بالوصول من هذا المصدر."));
    }
  },
};
const corsMiddleware = cors(corsOptions);

/**
 * دالة للتحقق من JWT باستخدام Next.js Middleware.
 * نستخدم req.headers.get('cookie') للحصول على قيمة الكوكيز.
 */
export function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid Token" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return res.status(403).json({ message: "Invalid token." });
  }
}

export async function middleware(req) {
  console.log("Middleware applied to:", req.nextUrl.pathname);
  const res = NextResponse.next();

  try {
    // تطبيق إجراءات الأمان الأساسية
    await new Promise((resolve) => helmetMiddleware(req, res, resolve));
    await new Promise((resolve) => xssCleanMiddleware(req, res, resolve));
    await new Promise((resolve) => mongoSanitizeMiddleware(req, res, resolve));

    // تطبيق CORS أولاً
    await new Promise((resolve, reject) => {
      corsMiddleware(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // تطبيق Rate Limit
    await new Promise((resolve, reject) => {
      limiter(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // التحقق من الجلسة النشطة
    const session = await getSession({ req });

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // التحقق من الجلسات النشطة الأخرى
    const activeSessions = await Session.find({
      userId: session.user.id,
      expires: { $gt: new Date() },
      sessionToken: { $ne: session.sessionToken }, // استثناء الجلسة الحالية
    });

    if (activeSessions.length > 0) {
      // حذف الجلسات القديمة أو رفض الوصول
      await Session.deleteMany({ userId: session.user.id });
      return NextResponse.redirect(
        new URL("/login?error=multiple_sessions", req.url),
      );
    }

    // تطبيق CSRF بعد التحقق من الجلسة
    await new Promise((resolve, reject) => {
      csrfProtection(req, res, (err) => (err ? reject(err) : resolve()));
    });

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: "/api/:path*", // تطبيق على جميع مسارات API
};
