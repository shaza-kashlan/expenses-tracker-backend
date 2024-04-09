const { Schema, model } = require("mongoose");
const { userAddressSchema } = require("./Address.model");

// Define User Schema
const userSchema = new Schema(
  {
    emailAddress: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    userName: {
      type: String,
      required: [true, "UserName is required."],
    },
    fullName: {
      type: String,
      default: "",
    },
    address: userAddressSchema,
    imageUrl: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
    },
  },
  {
    // Enable timestamps for createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create User model
const User = model("User", userSchema);

module.exports = User;
