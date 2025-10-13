import NationalID from './../models/NationalID.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

mongoose.connect(process.env.MONGODB_NATIONAL_ID_URI)
const nationalid = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_NATIONAL_ID_URI);

    // ////this one for testing purposes only
    const national = await NationalID.deleteMany({});
    if (national.deletedCount > 0) {
      console.log("All nationals deleted.");
    } else {
      console.log("No nationals to delete.");
    }


    process.exit(0); // 0 = success
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1); // 1 = error
  }
};


// Call function at startup
nationalid();
