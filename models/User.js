const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isGoogle: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      // required: true,
    },
    googleId: {
      type: String,
    },

    status: {
      type: String,
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    role: {
      type: String,
      default: "user",
    },
    demoTrade: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    demoStartDate: {
      type: Date,
    },
    demoEndDate: {
      type: Date,
    },
    demoBalance: {
      type: Number,
      default: 10000,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      // required: true,
    },

    stripeId: {
      type: String,
    },

    realTrade: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("TAUser", userSchema);
module.exports = User;
