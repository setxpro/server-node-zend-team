const mongoose = require("mongoose");

const Support = mongoose.model("Support", {
  type: String,
  screenshot: String,
  comment: String,
});

module.exports = Support;
