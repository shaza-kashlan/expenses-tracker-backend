const { Schema, model } = require("mongoose");
const Address = require("./Address.model");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
		address: {
			type: Schema.Types.ObjectId,
			ref: "UserAddress",
			default: new Address(),
		},
		image: {
			type: String,
			default: "",
		},
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

const User = model("User", userSchema);

module.exports = User;
