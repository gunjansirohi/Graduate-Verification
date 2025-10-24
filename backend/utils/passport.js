// passport.js
const passport = require("passport");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

// Serialize user for session (optional if using sessions)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
