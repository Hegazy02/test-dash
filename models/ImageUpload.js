// src/models/ImageUpload.js
import mongoose from "mongoose";

const ImageUploadSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  page: { type: String, required: true, index: true },
  url: { type: String, required: true },
  altText: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});
ImageUploadSchema.index({ siteId: 1, page: 1, url: 1 }, { unique: true });
function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const ImageUpload = createModel("ImageUpload", ImageUploadSchema);
export default ImageUpload;
