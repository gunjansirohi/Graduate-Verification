const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Certificate = require("../models/Certificate");
const dotenv = require("dotenv");
const mongoose  = require("mongoose");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const certificate = await Certificate.deleteMany({});
    if (certificate.deletedCount > 0) {
      console.log("All certificates deleted.");
    } else {
      console.log("No certificates to delete.");
    }


    process.exit(0); // 0 = success
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1); // 1 = error
  }
};


// Call function at startup
createAdmin();
