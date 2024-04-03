const { Schema, model } = require("mongoose");

const expenseSchema = new Schema({
	description: {
		type: String,
		required: [true, "description is required."],
	},
	amount: {
		type: Number,
		// or Number
		required: [true, "amount is required."],
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: "Category",
	},
	date: {
		type: String,
		required: [true, "date is required."],
	},
	payment_method: {
		type: String,
		required: [true, "payment method is required."],
	},
	expense_type: {
		type: String,
	},
	notes: {
		type: String,
	},
	tags: {
		type: [String],
	},
	created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
	// job_id ??
});

expenseSchema.methods.toJSON = function () {
	const { created_by_user_id, ...expense } = this._doc;

	return expense;
};

const Expense = model("Expense", expenseSchema);
module.exports = Expense;
