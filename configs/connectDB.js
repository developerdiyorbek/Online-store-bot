import mongoose from "mongoose";
import ENV from "./env.js";

async function connectDB() {
  try {
    await mongoose.connect(ENV.MONGOGB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export default connectDB;
