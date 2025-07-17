// src/models/PageContent.js
import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true },
  content: { type: String },
  images: [
    {
      url: { type: String },
      alt: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
PageContentSchema.index({ siteId: 1, page: 1 }, { unique: true });

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const PageContent = createModel("PageContent", PageContentSchema);
export default PageContent;
