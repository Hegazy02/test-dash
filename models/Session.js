// src/models/Session.js
import mongoose from "mongoose";

// تعريف مخطط الجلسة مع الحقول الإضافية
const SessionSchema = new mongoose.Schema(
  {
    // الرمز الفريد للجلسة (مطلوب من NextAuth)
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true, // فهرس لتحسين البحث
    },

    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },

    expires: {
      type: Date,
      required: true,
      index: true,
    },

    location: {
      country: String,
      city: String,
      timezone: String,
    },
    fingerprint: {
      visitorId: String,
      requestId: String,
      browserName: String,
      browserVersion: String,
      device: String,
      os: String,
      osVersion: String,
      ip: String,
      location: {
        city: String,
        country: String,
        timezone: String,
      },
      userAgent: String,
    },
    activityLog: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["login", "logout", "refresh"], // أنواع الأنشطة المسموحة
          required: true,
        },
        ip: {
          type: String,
          required: true,
        },
      },
    ],
  },
  // خيارات إضافية للمخطط
  {
    timestamps: true, // إضافة createdAt و updatedAt تلقائيًا
    collection: "sessions", // اسم المجموعة في MongoDB
  },
);

// Middleware قبل الحفظ لتحديث البيانات
SessionSchema.pre("save", function (next) {
  if (!this.location) {
    this.location = {}; // تهيئة كائن الموقع إذا كان غير موجود
  }
  next();
});

// دالة مساعدة للحصول على الجلسات النشطة
SessionSchema.statics.findActiveSessions = async function (userId) {
  return this.find({
    userId,
    expires: { $gt: new Date() },
  }).sort({ createdAt: -1 }); // ترتيب حسب الأحدث
};

// تجنب تكرار النماذج في حال إعادة التحميل
function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

// SessionSchema.index({ sessionToken: 1 });
// SessionSchema.index({ userId: 1 });
// SessionSchema.index({ expires: 1 });

const Session = createModel("Session", SessionSchema);

export default Session;
