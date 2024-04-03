const express = require("express");
const router = express.Router();
const Payee = require("../models/Payee.model");
const FAKE_USER_ID = { _id: "660d205410464d8fa79a3fef" };

// TODO: add auth middleware when available

router.get("/", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;

	try {
		const payees = await Payee.find({
			$or: [{ created_by_user_id: user_id }, { public: true }],
		});
		res.status(200).json(payees);
	} catch (err) {
		console.error("error in get all payees", err);
		next(err);
	}
});

router.post("/", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const newPayeeBody = req.body;
	newPayeeBody.created_by_user_id = user_id || FAKE_USER_ID;

	// TODO: handle create icon if included, create mappings if included
	try {
		const newPayee = await Payee.create(newPayeeBody);
		res.status(201).json(newPayee);
	} catch (err) {
		console.error("got an error creating a payee", err);
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a payee with that name, please try again with something a little more unique",
			});
			return;
		}
		if (err._message === "Payee validation failed") {
			res.status(400).json({
				code: 400,
				reason: "validation_failed",
				message: `${err.toString().split("Payee validation failed:")}`,
			});
			return;
		}

		next(err);
	}
});

router.get("/:payeeId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { payeeId } = req.params;

	try {
		const payee = await Payee.findById(payeeId);
		if (!payee) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}
		if (payee.created_by_user_id.toString() !== user_id) {
			console.log("testing", payee.created_by_user_id.toString() !== user_id);
			console.log("payee", payee.created_by_user_id.toString());
			console.log("userid", user_id);
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
			return;
		}

		res.status(200).json(payee);
		return;
	} catch (err) {
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}
		console.error("error in find payee by ID", err);
		next(err);
	}
});

router.put("/:payeeId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { payeeId } = req.params;
	const updatedVersion = req.body;

	try {
		const payee = await Payee.findById(payeeId);
		if (!payee) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}

		if (payee.created_by_user_id.toString() !== user_id) {
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
			return;
		}
		// TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
		// for example, changing the name to something that already exists
		const updatedPayee = await Payee.findByIdAndUpdate(
			payeeId,
			updatedVersion,
			{ new: true },
		);
		res.status(201).json(updatedPayee);
		return;
	} catch (err) {
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a payee with that name, please try again with something a little more unique",
			});
			return;
		}
		console.error("error in update payee by ID", err);
		next(err);
	}
});

router.delete("/:payeeId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { payeeId } = req.params;

	try {
		const payee = await Payee.findById(payeeId);
		if (!payee) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}
		if (payee.created_by_user_id.toString() !== user_id && !payee.public) {
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
			return;
		}
		const deletedPayee = await Payee.findByIdAndDelete(payeeId);
		res.status(204).end();
		return;
	} catch (err) {
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a payee with that ID" });
			return;
		}
		console.error("error in delete payee by ID", err);
		next(err);
	}
});

module.exports = router;
