const { Schema, model } = require("mongoose");

const iconSchema = new Schema(
	{
		type: { type: String, enum: ["link", "base64"] },
		url: String,
		data: String,
		created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

const Icon = model("Icon", iconSchema);

module.exports = Icon;
