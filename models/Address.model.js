const { Schema, model } = require("mongoose");

//
const userAddressSchema = new Schema({
  street: {
    type: String,
    default: "",
  },
  number: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  postcode: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
});

const UserAddress = model("UserAddress", userAddressSchema);
module.exports = UserAddress;
