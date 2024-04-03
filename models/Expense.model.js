const { Schema, model } = require("mongoose");

//
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
    type: String,
  },
  // job_id ??
});

const Expense = model("Expense", expenseSchema);
module.exports = Expense;
