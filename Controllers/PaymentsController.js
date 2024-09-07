const User = require("../models/User");
const Wallet = require("../models/UserWallet");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");
exports.createPaymentIntent = async (req, res) => {
  try {
    const { email, amount, paymentMethodId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a customer if it doesn't exist
    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to cents
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true, // for payments without user interaction
      confirm: true, // Confirm the payment immediately
      description: `Deposit of $${amount} by ${email}`,
      receipt_email: email,
    });

    const balance = user.balance + amount;

    // Update the user's wallet balance

    await user.updateOne({
      stripeId: paymentIntent.customer,
      balance: balance,
      type: "deposit",
      currency: paymentIntent.currency,
    });

    logger(JSON.stringify(paymentIntent), "payments.txt");

    console.log("Payment successful:", paymentIntent);
    res
      .status(200)
      .json({
        message: "Payment successful",
        stripeId: paymentIntent.customer,
        balance: balance,
        type: "deposit",
        currency: paymentIntent.currency,
      });
  } catch (error) {
    console.error("Error during payment intent creation:", error);
    res.status(500).json({
      message: "Payment failed. Please try again later.",
      error: error.message,
    });
  }
};

exports.refundPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    const user = await User.findOne({ stripeId: paymentIntentId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid refund amount" });
    }

    // Update the user's balance
    user.balance -= amount;
    await user.save();

    console.log("Refund successful for user:", user);

    // Return the new balance
    res
      .status(200)
      .json({ message: "Refund successful", balance: user.balance });
  } catch (error) {
    console.error("Error during refunding payment intent:", error);
    res.status(500).json({
      message: "Refund failed. Please try again later.",
      error: error.message,
    });
  }
};
