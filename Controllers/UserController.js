const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/smtp"); // Adjust the path as necessary
const mongoose = require("mongoose");
const registerUser = async (req, res) => {
  try {
    const { email, password, timeZone } = req.body; // Ensure timeZone is provided in request
    if (!email || !password || !timeZone) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salts = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salts);

    const newUser = new User({
      email,
      password: hashedPassword,
      currency: "usd",
      status: "active",
      isVerified: false,
      timezone: timeZone,
      role: "user",
      lastLogin: null, // Initialize lastLogin field
      demoStartDate: new Date(), // Set demoStartDate to now
      demoEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set demoEndDate to 7 days later
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      throw new Error("Something went wrong saving the user");
    }

    res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params; // Get userId from the request parameters
  const updateData = req.body; // Get update data from request body

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated user
      runValidators: true, // Run validation on the updated fields
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser); // Respond with the updated user
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateUserPassword = async (req, res) => {
  const { userId } = req.params; // Get userId from the request parameters
  const { currentPassword, newPassword } = req.body; // Get the current and new passwords from the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.params; // Get userId from the request parameters

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" }); // Respond with success message
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getUser = async (req, res) => {};

const saveOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("email", email);
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userExists = await User.findOne({ email });
    console.log("userExists", userExists);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    // Set expiry time to 5 minutes from now
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds
    console.log("expiryTime", expiryTime);

    // Save OTP and expiry time in user document
    userExists.otp = otp;
    userExists.otpExpiry = expiryTime;

    const savedUser = await userExists.save();
    console.log("savedUser", savedUser);
    if (!savedUser) {
      throw new Error("Failed to save OTP");
    }

    res.status(200).json({ message: "OTP saved successfully" });
  } catch (error) {
    console.error("Error during sending OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, userId } = req.body;
    if (!email || !otp || !userId) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const userExists = await User.findOne({ userId });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userExists.email !== email) {
      return res.status(403).json({ message: "Invalid email" });
    }

    // Check if the OTP has expired
    if (Date.now() > userExists.otpExpiry) {
      return res.status(403).json({ message: "OTP has expired" });
    }

    if (userExists.otp !== otp) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    // Update user status to active
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { status: "active" },
      { new: true } // Ensure that the updated user is returned
    );

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user status" });
    }

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error during verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already verified
    if (userExists.isVerified) {
      return res.status(403).json({ message: "User is already verified" });
    }

    if (userExists.otp !== otp) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    // Update user status to verified
    const updatedUser = await User.findByIdAndUpdate(
      userExists._id, // Use the user's ID for the update
      { isVerified: true, realTrade: true }, // Update the user's status to active
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user status" });
    }

    // Respond with success message and updated user details (optional)
    res.status(200).json({
      message: "User verified successfully",
      user: {
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        realTrade: updatedUser.realTrade,
      }, // Include relevant user details
    });
  } catch (error) {
    console.error("Error during verifying user:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const updateWalletAfterTrade = async (req, res) => {
  try {
    const { userId, amount, type } = req.body;

    if (!userId || amount === undefined || !type) {
      return res.status(400).json({ message: "Enter all fields" });
    }

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the balance and type fields
    userExists.balance += Number(amount); // Ensure amount is a number
    userExists.type = type;

    await userExists.save();

    res.status(200).json({
      message: "Wallet updated successfully",
      balance: userExists.balance,
    });
  } catch (error) {
    console.error("Error during updating wallet after trade:", error.message);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

module.exports = {
  registerUser,
  updateUser,
  deleteUser,
  getUser,
  updateUserPassword,
  verifyOTP,
  verifyUser,
  saveOTP,
  updateWalletAfterTrade,
};
