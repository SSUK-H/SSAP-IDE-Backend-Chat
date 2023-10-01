const express = require("express");
const router = express.Router();
const chatHistory = require("../data/chatHistory");

router.get("/", (req, res) => {
  console.log("sendMessage", chatHistory);
  res.status(200).send(chatHistory);
});

module.exports = router;
