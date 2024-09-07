const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Import your User model

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let userExists = await User.findOne({ googleId: profile.id });

        if (userExists) {
          // Update last login date
          userExists.lastLogin = Date.now();
          await userExists.save();
        } else {
          // Create a new user if not exists
          userExists = new User({
              googleId: profile.id,
              name: profile.displayName, // Assuming displayName is stored as name
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              currency: "usd",
              role: "user",
              status: "active",
              isVerified: false,
              isGoogle: true,
            balance: 0,
            lastLogin: new Date(), // Initialize lastLogin field
            demoStartDate: new Date(), // Set demoStartDate to now
            demoEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set demoEndDate to 7 days later
            // Set any other fields as necessary
          });
          await userExists.save();
        }

        // Custom user data to return
        const userData = {
          currAccType: "demo",
          user: {
            id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            avatar: userExists.avatar,
            status: userExists.status,
            lastLogin: userExists.lastLogin,
            role: userExists.role,
            verified: userExists.isVerified,
            demoAllowed: userExists.demoTrade,
            realTradeAllowed: userExists.realTrade,
            isGoogle: userExists.isGoogle,
          },
          wallet: {
            balance: userExists.balance,
            currency: userExists.currency,
            type: userExists.type,
            stripeId: userExists.stripeId,
          },
          message: "User logged in successfully",
        };

        done(null, userData); // Call done with the user data to be serialized
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user); // Serialize the entire user object or user ID
});

passport.deserializeUser((user, done) => {
  done(null, user); // Deserialize the user object
});

module.exports = passport;
