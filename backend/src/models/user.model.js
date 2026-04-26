import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    avatar: { type: String, default: "" },
    password: { type: String, minLength: 6 },
    phone: { type: String, unique: true, trim: true, minLength: 10 },
    bio: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeenAt: { type: Date }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
