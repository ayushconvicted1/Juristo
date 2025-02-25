import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Schema for individual API keys.
const apiKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    expires: { type: Date, default: null },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Optional userId generated if not provided.
    userId: { type: String, unique: true, sparse: true },
    plan: {
      type: String,
      enum: ["basic", "super", "advance"],
      default: "basic",
    },
    country: {
      label: { type: String, default: "India" },
      value: { type: String, default: "IN" },
    },
    language: {
      label: { type: String, default: "English" },
      value: { type: String, default: "EN" },
    },
    draftCount: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Array to store multiple API keys.
    apiKeys: { type: [apiKeySchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.userId) {
    this.userId = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
