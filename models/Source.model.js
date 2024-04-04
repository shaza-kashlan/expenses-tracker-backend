const { Schema, model } = require("mongoose");

const sourceSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required."],
			unique: true,
			lowercase: true,
			trim: true,
		},
		type: {
			type: String,
			enum: ["bank_statement", "credit_card_statement", "invoice"],
			required: [true, "Type is required."],
		},
		format: {
			type: String,
			enum: ["csv", "tsv", "text", "md", "json"],
			required: [true, "Format is required."],
		},
		icon: {
			type: Schema.Types.ObjectId,
			ref: "Icon",
		},
		public: { type: Boolean, default: true },
		unique_field: String,
		mapping: [{ type: Schema.Types.ObjectId, ref: "Mapping" }],
		created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

sourceSchema.methods.toJSON = function () {
	const { created_by_user_id, ...sourceToReturn } = this._doc;

	return sourceToReturn;
};

const Source = model("Source", sourceSchema);

module.exports = Source;
