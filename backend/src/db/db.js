import mongoose from "mongoose";
import { MONGO_DB_URI } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_DB_URI);
    console.log(`MongoDb connected:${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDb connection error", error);
  }
};
