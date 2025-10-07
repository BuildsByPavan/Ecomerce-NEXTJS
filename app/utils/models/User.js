import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    profilePic: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
