// src/models/MetaDescription.js
import mongoose from "mongoose";

const MetaDescriptionSchema = new mongoose.Schema(
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
    metaDescriptionAr: {
      type: String,
      required: true,
      maxlength: 160,
    },
    metaDescriptionEn: {
      type: String,
      required: true,
      maxlength: 160,
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
MetaDescriptionSchema.pre("save", function (next) {
  this.length = this.metaDescriptionEn.length;
  next();
});

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  return mongoose.model(modelName, schema);
}

const MetaDescription = createModel("MetaDescription", MetaDescriptionSchema);
export default MetaDescription;
