const { Schema, model } = require("mongoose");

//
const mappingSchema = new Schema({
  date: {
    type: String,
  },
  description: {
    type: String,
  },
  notes: {
    type: String,
  },
  amounts: {
    type: String,
  },
});

const Mapping = model("Mapping", mappingSchema);
module.exports = Mapping;
