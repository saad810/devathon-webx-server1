const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Amount should be non-negative
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "trade"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"], // Track the transaction status
      default: "pending",
    },
  },
  {
    _id: false, // Prevent automatic creation of an _id for subdocuments
  }
);

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TAUser", // Reference to the user model
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0, // Ensure balance cannot be negative
    },
    currency: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[A-Z]{3}$/.test(value); // ISO 4217 currency format (3 uppercase letters)
        },
        message: props => `${props.value} is not a valid currency format!`,
      },
    },
    transactions: [transactionSchema],
    dailyDepositLimit: {
      type: Number,
      default: 10000, // Set a default limit (customize as needed)
    },
    dailyWithdrawalLimit: {
      type: Number,
      default: 5000, // Set a default limit (customize as needed)
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for performance improvement
walletSchema.index({ userId: 1, currency: 1 }); // Index on userId and currency
walletSchema.index({ "transactions.date": 1 }); // Index on transaction dates

module.exports = mongoose.model("Wallet", walletSchema);
