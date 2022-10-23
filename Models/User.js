const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  username: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  assignment: String,
  avatar: String,
});

module.exports = User;
