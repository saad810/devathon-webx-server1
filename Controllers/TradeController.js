const mongoose = require("mongoose");
const Trade = require("../models/Trade");
const User = require("../models/User");


const createTrade = async (req, res) => {
  try {
    const {
      stake,
      tradeType,
      tradePair,
      multiplier,
      tradeEntry,
      tradeClosePrice,
      isDemo,
      tradeUserId,
      tradeWinNumb,
      profitVal,
    } = req.body;


    const userExists = await User.findById(tradeUserId);
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Ensure all necessary fields are provided
    if (
      !stake ||
      !tradeType ||
      !tradePair ||
      !multiplier ||
      !tradeEntry ||
      !tradeClosePrice
    ) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    let newTrade;

    // Handle demo trade
    if (tradeType === "demo") {
      newTrade = new Trade({
        tradeType: "multiplier",
        tradePair: tradePair,
        tradeEntry: tradeEntry,
        tradeClosePrice: tradeClosePrice,
        multiplier: multiplier,
        tradeAmount: stake,
        isDemo: isDemo,
        tradeUserId: tradeUserId,
        profitVal: profitVal,
        tradeWinNumb: tradeWinNumb,
      });

      const savedTrade = await newTrade.save();
      if (!savedTrade) {
        throw new Error("Something went wrong saving the trade");
      }

      return res.status(200).json({
        message: "Demo trade recorded successfully",
      });
    }

    // Handle real trades
    if (userExists.balance < stake) {
      return res
        .status(400)
        .json({ message: "Insufficient balance for the trade" });
    }

    // Deduct the stake from the user's balance
    userExists.balance -= stake;
    await userExists.save();

    newTrade = new Trade({
      tradeType: tradeType,
      tradePair: tradePair,
      tradeEntry: tradeEntry,
      tradeClosePrice: tradeClosePrice,
      multiplier: multiplier,
      tradeAmount: stake,
      tradeWinNumb: tradeWinNumb,
      tradeUserId: tradeUserId,
      isDemo: isDemo,
      profitVal: profitVal,
    });

    const savedTrade = await newTrade.save();
    if (!savedTrade) {
      throw new Error("Something went wrong saving the trade");
    }

    res.status(200).json({
      message: "Real trade recorded successfully",
    });
  } catch (error) {
    console.error("Error during trade creation:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const getTrades = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the tradeUserId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const trades = await Trade.find({ tradeUserId: id });
    if (!trades) {
      return res.status(404).json({ message: "No trades found" });
    }

    res.status(200).json({
      message: "Trades retrieved successfully",
      trades: trades,
    });
  } catch (error) {
    console.error("Error retrieving trades:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};
module.exports = {
  createTrade,
  getTrades,
};
