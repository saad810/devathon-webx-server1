// routes/payments.js
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  refundPaymentIntent,
} = require("../Controllers/PaymentsController");

router.post("/deposit", createPaymentIntent); // For deposits
router.post("/withdraw", refundPaymentIntent); // For withdrawals

module.exports = router;
