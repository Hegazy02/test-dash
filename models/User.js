import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: false },
    id: { type: String, required: true },
    role: { type: String, required: true, default: "User" },
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    PhoneNumber: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

function createModel(modelName, schema) {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, schema);
}

const User = createModel("User", userSchema);

export default User;
