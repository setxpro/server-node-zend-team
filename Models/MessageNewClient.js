const mongoose = require("mongoose");

const MessageClient = mongoose.model("MessageClient", {
  name: String,
  email: String,
  phone: String,
  message: String,
});

module.exports = MessageClient;
