const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // update last login date

    const updatedLoginDate = await User.findOneAndUpdate(
      { email: email },
      { lastLogin: new Date() },
      { new: true } // Ensure that the updated user is returned
    );

    // Validate password
    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userInfo: {
          email: userExists.email,
          id: userExists._id,
          status: userExists.status,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10w" }
    );

    // Generate refresh token
    // const refreshToken = jwt.sign(
    //   {
    //     userInfo: {
    //       email: userExists.email,
    //       id: userExists._id,
    //       status: userExists.status,
    //     },
    //   },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   { expiresIn: "4w" } // Token valid for 4 weeks
    // );

    // Log refresh token for debugging
    // console.log("Refresh token before setting cookie:", refreshToken);

    // // Set refresh token as a cookie
    // res.cookie("accessToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Only true in production
    //   sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Lax for development
    //   maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
    //   path: "/", // Accessible from all paths
    // });
    // res.cookie("role", userExists.role, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production", // Only true in production
    //     sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Lax for development
    //     maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
    // })

    // Send access token in response
    res.status(200).json({
      token: accessToken,
      user: {
        id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        singleSignin: userExists.singleSigninLinkAllowed,
        status: userExists.status,
        lastLogin: updatedLoginDate.lastLogin,
        role: userExists.role,
        verified: userExists.isVerified,
        demoAllowed: userExists.demoTrade,
        realTradeAllowed: userExists.realTrade,
        timezone: userExists.timezone,
      },
      wallet: {
        balance: userExists.balance,
        currency: userExists.currency,
        type: userExists.type,
        stripeId: userExists.stripeId,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: error.message }); // Changed to 500 for server errors
  }
};

module.exports = {
  loginUser,
  
};
