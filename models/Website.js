// src/models/Website.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// نموذج الصفحة
const pageSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    metaTitleAr: {
      type: String,
      maxlength: 60,
    },
    metaTitleEn: {
      type: String,
      maxlength: 60,
    },
    metaDescriptionAr: {
      type: String,
      maxlength: 160,
    },
    metaDescriptionEn: {
      type: String,
      maxlength: 160,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    isHomePage: {
      type: Boolean,
      default: false,
    },
    page404from: {
      type: String,
      default: null,
    },
    RedirectPage: {
      type: String,
      default: null,
    },
    is404Page: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    blogID: {
      type: String,
      default: "0",
    },
  },
  {
    timestamps: true,
  },
);

// ✅ إضافة middleware للتأكد من أن uuid و blogID لا يتغيران بشكل عشوائي
pageSchema.pre("save", function (next) {
  // إذا كان uuid غير موجود، أنشئ واحد جديد
  if (!this.uuid) {
    this.uuid = uuidv4();
  }

  // ✅ حماية خاصة لصفحة المدونة
  if (this.slug === "blog" && (!this.blogID || this.blogID === "0")) {
    this.blogID = "1"; // إجبار blogID = "1" لصفحة المدونة
    console.log("🔒 تم حماية blogID لصفحة المدونة وتعيينه إلى '1'");
  }

  // إذا كان blogID غير موجود أو فارغ، اجعله "0" (للصفحات العادية فقط)
  if (!this.blogID && this.slug !== "blog") {
    this.blogID = "0";
  }

  next();
});

// نموذج الموقع
const websiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
    },
    pages: [pageSchema],
    defaultPages: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ إضافة middleware لصفحات جديدة تُضاف إلى المصفوفة
websiteSchema.pre("save", function (next) {
  if (this.pages && this.pages.length > 0) {
    this.pages.forEach((page) => {
      // إذا كان uuid غير موجود، أنشئ واحد جديد
      if (!page.uuid) {
        page.uuid = uuidv4();
      }

      // ✅ حماية خاصة لصفحة المدونة
      if (page.slug === "blog") {
        if (!page.blogID || page.blogID === "0") {
          page.blogID = "1";
          console.log("🔒 تم حماية blogID لصفحة المدونة وتعيينه إلى '1'");
        }
      } else {
        // للصفحات العادية: إذا كان blogID غير موجود أو فارغ، اجعله "0"
        if (!page.blogID) {
          page.blogID = "0";
        }
      }
    });
  }
  next();
});

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  return mongoose.model(modelName, schema);
}

const Website = createModel("Website", websiteSchema);
export default Website;
