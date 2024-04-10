const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const FAKE_USER_ID = { _id: "660d205410464d8fa79a3fef" };

router.get("/", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const {include_source_details} = req.query;

	try {
		const expenses = await Expense.find({
			created_by_user_id: user_id,
		}).populate({path: "category", select: "name description"}).populate(include_source_details === "true"? {path: "source", select: "name type"} :  "");
		res.status(200).json(expenses);
	} catch (err) {
		console.error("error in get all expenses", err);
		next(err);
	}
});

router.post("/", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const newExpenseBody = req.body;
	newExpenseBody.created_by_user_id = user_id;

	// TODO: handle create icon if included, create mappings if included
	try {
		const newExpense = await Expense.create(newExpenseBody);
		res.status(201).json(newExpense);
	} catch (err) {
		console.error("got an error creating a expense", err);
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a expense with that name, please try again with something a little more unique",
			});
			return;
		}
		if (err._message === "Expense validation failed") {
			res.status(400).json({
				code: 400,
				reason: "validation_failed",
				message: `${err.toString().split("Expense validation failed:")}`,
			});
			return;
		}

		next(err);
	}
});

router.get("/:expenseId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { expenseId } = req.params;
	const {include_source_details} = req.query;

	try {
		const expense = await Expense.findById(expenseId).populate({path: "category", select: "name description"}).populate(include_source_details === "true" ? {path: "source", select: "name type"} :  "");
		if (!expense) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		if (expense.created_by_user_id.toString() !== user_id) {
			// just keeping this separate in case we want to change to unauthorized later
			// but it should be good like this for now
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}

		res.status(200).json(expense);
		return;
	} catch (err) {
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		console.error("error in find expense by ID", err);
		next(err);
	}
});

router.put("/:expenseId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { expenseId } = req.params;
	const updatedVersion = req.body;

	try {
		const expense = await Expense.findById(expenseId);
		if (!expense) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}

		if (expense.created_by_user_id.toString() !== user_id) {
			// just keeping this separate in case we want to change to unauthorized later
			// but it should be good like this for now
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		// TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
		// for example, changing the name to something that already exists
		const updatedExpense = await Expense.findByIdAndUpdate(
			expenseId,
			updatedVersion,
			{ new: true },
		);
		res.status(200).json(updatedExpense);
		return;
	} catch (err) {
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a expense with that name, please try again with something a little more unique",
			});
			return;
		}
		console.error("error in update expense by ID", err);
		next(err);
	}
});

router.delete("/:expenseId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { expenseId } = req.params;

	try {
		const expense = await Expense.findById(expenseId);
		if (!expense) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		if (expense.created_by_user_id.toString() !== user_id) {
			// just keeping this separate in case we want to change to unauthorized later
			// but it should be good like this for now
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		const deletedExpense = await Expense.findByIdAndDelete(expenseId);
		res.status(204).end();
		return;
	} catch (err) {
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a expense with that ID" });
			return;
		}
		console.error("error in delete expense by ID", err);
		next(err);
	}
});

module.exports = router;
