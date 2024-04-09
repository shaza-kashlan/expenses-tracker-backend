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

userAddressSchema.methods.toJSON = function () {
  const { _id, ...addressToReturn } = this._doc;

  return addressToReturn;
};

const UserAddress = model("UserAddress", userAddressSchema);

module.exports = { UserAddress, userAddressSchema };
