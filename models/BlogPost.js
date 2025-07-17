// src/models/BlogPost.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const BlogPostSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  blogID: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return uuidv4().replace(/-/g, "").substring(0, 8);
    },
  },
  titleEN: {
    type: String,
    required: function () {
      return this.blogType === "english" || this.blogType === "both";
    },
  },
  titleAR: {
    type: String,
    required: function () {
      return this.blogType === "arabic" || this.blogType === "both";
    },
  },
  slug: {
    type: String,
    required: true,
  },
  blogType: {
    type: String,
    required: true,
    enum: ["arabic", "english", "both"],
    default: "english",
  },
  contentAR: {
    type: String,
    required: function () {
      return this.blogType === "arabic" || this.blogType === "both";
    },
  },
  contentEN: {
    type: String,
    required: function () {
      return this.blogType === "english" || this.blogType === "both";
    },
  },
  excerptEN: { type: String },
  excerptAR: { type: String },
  authorEN: { type: String },
  authorAR: { type: String },
  tagsEN: [{ type: String }],
  tagsAR: [{ type: String }],
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  featuredImage: {
    type: String,
    required: false,
  },
  imageAltEN: {
    type: String,
    required: false,
  },
  imageAltAR: {
    type: String,
    required: false,
  },
  categoryEN: {
    type: String,
    required: function () {
      return this.blogType === "english" || this.blogType === "both";
    },
  },
  categoryAR: {
    type: String,
    required: function () {
      return this.blogType === "arabic" || this.blogType === "both";
    },
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

BlogPostSchema.pre("save", function (next) {
  if (!this.blogID) {
    this.blogID = uuidv4().replace(/-/g, "").substring(0, 8);
  }

  if (this.blogType === "arabic" && !this.titleAR) {
    return next(new Error("Arabic title is required for Arabic blog type"));
  }
  if (this.blogType === "english" && !this.titleEN) {
    return next(new Error("English title is required for English blog type"));
  }
  if (this.blogType === "both" && (!this.titleAR || !this.titleEN)) {
    return next(
      new Error(
        "Both Arabic and English titles are required for bilingual blog type",
      ),
    );
  }

  if (this.blogType === "arabic" && !this.contentAR) {
    return next(new Error("Arabic content is required for Arabic blog type"));
  }
  if (this.blogType === "english" && !this.contentEN) {
    return next(new Error("English content is required for English blog type"));
  }
  if (this.blogType === "both" && (!this.contentAR || !this.contentEN)) {
    return next(
      new Error(
        "Both Arabic and English content are required for bilingual blog type",
      ),
    );
  }

  if (this.blogType === "arabic" && !this.categoryAR) {
    return next(new Error("Arabic category is required for Arabic blog type"));
  }
  if (this.blogType === "english" && !this.categoryEN) {
    return next(
      new Error("English category is required for English blog type"),
    );
  }
  if (this.blogType === "both" && (!this.categoryAR || !this.categoryEN)) {
    return next(
      new Error(
        "Both Arabic and English categories are required for bilingual blog type",
      ),
    );
  }

  this.updatedAt = new Date();
  next();
});

BlogPostSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

BlogPostSchema.index({ siteId: 1, slug: 1 }, { unique: true });
BlogPostSchema.index({ blogID: 1 }, { unique: true });
BlogPostSchema.index({ blogType: 1 });
BlogPostSchema.index({ publishedAt: -1 });
BlogPostSchema.index({ isFeatured: 1 });

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const BlogPost = createModel("BlogPost", BlogPostSchema);
export default BlogPost;
