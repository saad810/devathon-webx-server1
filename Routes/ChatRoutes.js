const { getResponse } = require("../Controllers/ChatBotController");

const router = require("express").Router();

router.post("/", getResponse);

module.exports = router;