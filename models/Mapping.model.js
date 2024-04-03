const { Schema, model } = require("mongoose");

const mappingSchema = new Schema(
	{
		date: String,
		description: String,
		notes: String,
		amount: String,
		created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

const Mapping = model("Mapping", mappingSchema);

module.exports = Mapping;
