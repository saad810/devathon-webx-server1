const express = require("express");

const { createTrade, getTrades } = require("../Controllers/TradeController");

const router = express.Router();

router.get("/:id", getTrades);
router.post("/", createTrade);

module.exports = router;
