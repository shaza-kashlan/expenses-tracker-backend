const { Schema, model } = require("mongoose");

const patternSchema = new Schema(
	{
		field: String,
		pattern: String,
		created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

const Pattern = model("Pattern", patternSchema);

module.exports = Pattern;
