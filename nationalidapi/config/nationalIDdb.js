import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_NATIONAL_ID_URI;
    if (!connectionString) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(connectionString);
    console.log("National ID MongoDB connected successfully ");
  } catch (error) {
    console.error("Error in connecting to MongoDB National ID:", error);
    process.exit(1);
  }
}

export default connectDB;

// PWD 6Yxq5O9YKtEm6Iks