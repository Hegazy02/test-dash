// src/models/Redirect.js
import mongoose from "mongoose";

const RedirectSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  fromPath: { type: String, required: true },
  toPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
RedirectSchema.index({ siteId: 1, from: 1 }, { unique: true });

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const Redirect = createModel("Redirect", RedirectSchema);
export default Redirect;
