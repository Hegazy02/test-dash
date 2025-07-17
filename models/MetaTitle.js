// src/models/MetaTitle.js
import mongoose from "mongoose";

const MetaTitleSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    metaTitleAr: {
      type: String,
      required: true,
      maxlength: 60,
    },
    metaTitleEn: {
      type: String,
      required: true,
      maxlength: 60,
    },
    length: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Middleware to calculate length before saving
MetaTitleSchema.pre("save", function (next) {
  this.length = this.metaTitleEn.length;
  next();
});

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  return mongoose.model(modelName, schema);
}

const MetaTitle = createModel("MetaTitle", MetaTitleSchema);
export default MetaTitle;
