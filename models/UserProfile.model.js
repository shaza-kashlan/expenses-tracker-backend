const { Schema, model } = require("mongoose");

//
const userProfileSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: {
    type: String,
    required: [true, "FullName is required."],
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "UserAddress",
  },
  image: {
    type: String,
  },
});

const UserProfile = model("UserProfile", userProfileSchema);
module.exports = UserProfile;
