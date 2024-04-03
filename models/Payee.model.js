const { Schema, model } = require("mongoose");

const payeeSchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		patterns: [{ type: Schema.Types.ObjectId, ref: "Pattern" }],
		default_category: { type: Schema.Types.ObjectId, ref: "Category" },
		icon: { type: Schema.Types.ObjectId, ref: "Icon" },
		public: { type: Boolean, default: false },
		created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	},
);

payeeSchema.methods.toJSON = function () {
	const { created_by_user_id, ...payeeToReturn } = this._doc;

	return payeeToReturn;
};

const Payee = model("Payee", payeeSchema);

module.exports = Payee;
