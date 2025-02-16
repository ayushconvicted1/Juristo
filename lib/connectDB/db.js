import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  // If already connected, do nothing
  if (isConnected) {
    console.log("Using existing DB connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB connection error:", error);
    throw error;
  }
}
