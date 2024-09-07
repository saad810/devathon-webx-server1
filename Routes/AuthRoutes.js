const express = require("express");
const passport = require("passport");
const router = express.Router();
const { loginUser } = require("../Controllers/AuthController");
router.post("/", loginUser);

// auth with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/login/failure",
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_SUCCESS_REDIRECT); // Redirect to your client app
  }
);

// Route to check if the user is authenticated
router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});
//

router.get("/login/failure", (req, res) => {
  res.status(401).json({ message: "Login failed", success: false });
});
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      message: "Login Success",
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", success: false });
      }
      res.status(200).json({ message: "Logged out successfully", success: true });
    });
  });
  
module.exports = router;
