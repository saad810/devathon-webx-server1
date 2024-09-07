const {
  registerUser,
  saveOTP,
  verifyUser,
  updateWalletAfterTrade,
  updateUser,
  deleteUser,
  updateUserPassword
} = require("../Controllers/UserController");
// const { signupRequestLimiter } = require("../Middlewares/rateLimiter");

const router = require("express").Router();

router.post("/", registerUser);
router.post("/save-otp", saveOTP);
router.post("/verify", verifyUser);
router.post("/update-wallet", updateWalletAfterTrade);
// put requests
router.put('/:userId/password', updateUserPassword);
router.put("/:userId", updateUser);
// delete requests
router.delete("/:userId", deleteUser);

module.exports = router;
