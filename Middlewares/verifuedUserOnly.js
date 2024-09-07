const User = require("../models/users"); // Adjust the path according to your project structure

const checkUserVerified = async (req, res, next) => {
  try {
    // Assuming req.user contains the user's email or ID from the JWT
    console.log("at user verified")
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ message: "User email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "User is not verified" });
    }

    // User is verified, proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = checkUserVerified;
