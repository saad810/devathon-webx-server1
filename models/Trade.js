const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    tradeType: {
      type: String, // e.g., "multiplier" or "accumulator"
      required: true,
    },
    tradePair: {
      type: String, // e.g., the symbol or pair being traded
      required: true,
    },
    tradeEntry: {
      type: Number, // Entry price at the time of "buy in"
      required: true,
    },
    tradeClosePrice: {
      type: Number, // Closing price at the time of "buy out"
      required: true,
    },
    multiplier: {
      type: String, // Multiplier value applied to the trade
      required: true,
    },
    tradeAmount: {
      type: Number, // The stake or amount of money put into the trade
      required: true,
    },
    tradeWinNumb: {
      type: Number, // To indicate if the trade was a win or loss
    },
    tradeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TAUser", // Assuming you have a User model
      required: true,
    },
    isDemo: {
      type: Boolean, // To indicate if it's a demo trade or a real one
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Trade = mongoose.model("Trade", tradeSchema);

module.exports = Trade;
