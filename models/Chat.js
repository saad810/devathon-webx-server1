const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
      // ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    timestamp: {
      type: String,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
