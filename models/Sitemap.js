// src/models/Sitemap.js
import mongoose from "mongoose";

const SitemapUrlSchema = new mongoose.Schema(
  {
    loc: { type: String, required: true },
    lastModified: { type: Date, required: true },
    priority: { type: Number, min: 0.0, max: 1.0, required: true },
    changeFreq: {
      type: String,
      enum: [
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
      ],
      required: true,
    },
  },
  { _id: false },
);

const SitemapSchema = new mongoose.Schema({
  siteId: { type: String, required: true, unique: true },
  lastGenerated: { type: Date, default: Date.now },
  urls: { type: [SitemapUrlSchema], default: [] },
});
function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const Sitemap = createModel("Sitemap", SitemapSchema);
export default Sitemap;
