// src/models/SlugControl.js
import mongoose from "mongoose";

const SlugControlSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  pageTitle: { type: String, required: true },
  currentSlug: { type: String, required: true },
  newSlug: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});
SlugControlSchema.index({ siteId: 1, currentSlug: 1 }, { unique: true });

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const SlugControl = createModel("SlugControl", SlugControlSchema);
export default SlugControl;
