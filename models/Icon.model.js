const { Schema, model } = require("mongoose");

//
const iconSchema = new Schema({
  type: {
    type: String,
    required: [true, "type of icon is required."],
  },
  url: {
    type: String,
  },
  date: {
    type: String,
  },
});

const Icon = model("Icon", iconSchema);
module.exports = Icon;
