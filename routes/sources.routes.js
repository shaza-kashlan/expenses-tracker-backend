const express = require("express");
const router = express.Router();
const Source = require("../models/Source.model");
const Mapping = require("../models/Mapping.model");
const Expense = require("../models/Expense.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const FAKE_USER_ID = { _id: "660d205410464d8fa79a3fef" };
const { csvToExpense } = require("../utilities/import");
const { CsvError } = require("csv-parse");


router.get("/", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;

	try {
		const sources = await Source.find({
			$or: [{ created_by_user_id: user_id }, { public: true }],
		});
		res.status(200).json(sources);
	} catch (err) {
		console.error("error in get all sources", err);
		next(err);
	}
});

router.post("/", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const newSourceBody = req.body;
	newSourceBody.created_by_user_id = user_id;

	// TODO: handle create icon if included, create mappings if included
	try {
		const newSource = await Source.create(newSourceBody);
		res.status(201).json(newSource);
	} catch (err) {
		console.error("got an error creating a source", err);
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a source with that name, please try again with something a little more unique",
			});
			return;
		}
		if (err._message === "Source validation failed") {
			res.status(400).json({
				code: 400,
				reason: "validation_failed",
				message: `${err.toString().split("Source validation failed:")}`,
			});
			return;
		}

		next(err);
	}
});

router.get("/:sourceId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { sourceId } = req.params;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && !source.public) {
			// leaving this as separate in case we want to change auth error later
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}

		res.status(200).json(source);
		return;
	} catch (err) {
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		console.error("error in find source by ID", err);
		next(err);
	}
});

router.put("/:sourceId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { sourceId } = req.params;
	const updatedVersion = req.body;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && source.public) {
			// leaving this separate in case we want to change it to an unauthenticated error later
			res
				.status(401)
				.json({ code: 401, message: "you do not have the authorata" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && !source.public) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		// TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
		// for example, changing the name to something that already exists
		const updatedSource = await Source.findByIdAndUpdate(
			sourceId,
			updatedVersion,
			{ new: true },
		);
		res.status(201).json(updatedSource);
		return;
	} catch (err) {
		console.error("error in update source by ID", err);
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a source with that name, please try again with something a little more unique",
			});
			return;
		}
		next(err);
	}
});

router.put("/:sourceId/mappings", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { sourceId } = req.params;
	const updatedVersion = req.body;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && source.public) {
			// leaving this separate in case we want to change it to an unauthenticated error later
			res
				.status(401)
				.json({ code: 401, message: "you do not have the authorata" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && !source.public) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		// TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
		// for example, changing the name to something that already exists

		const updatedMapping = await Source.findByIdAndUpdate(
			sourceId,
			{ mapping: updatedVersion },
			{ new: true },
		);
		const { date, description, notes, amount, payee } =
			updatedMapping._doc.mapping;
		res.status(200).json({ date, description, notes, amount, payee });
		return;
	} catch (err) {
		console.error("error in update source by ID", err);
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (err.toString().includes("E11000 duplicate key error")) {
			res.status(400).json({
				code: 400,
				reason: "duplicate_key",
				message:
					"there is already a source with that name, please try again with something a little more unique",
			});
			return;
		}
		next(err);
	}
});

router.post("/:sourceId/import", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { sourceId } = req.params;
	const {autocategorise = true} = req.query
	console.log(req.headers["content-type"])
	const csvToImport = req.body;

	console.log(autocategorise)

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id && !source.public) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		// TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
		// for example, changing the name to something that already exists
		const { separator, mapping, type, number_style, unique_field, date_format } = source._doc;
		// console.log({
		// 	separator: separator.toString(),
		// 	mapping: mapping,
		// 	type: type.toString(),
		// });
		const myConvertedExpenses = await csvToExpense(
			user_id,
			csvToImport,
			separator.toString(),
			{
				date: mapping.date,
				description: mapping.description,
				notes: mapping.notes,
				amount: mapping.amount,
				payee: mapping.payee,
				trx_id: unique_field,
			},
			type.toString(),
			number_style,
			date_format,
			autocategorise
		);
		//console.log(myConvertedExpenses);
		if (myConvertedExpenses == null) {
			res
				.status(500)
				.json({ code: 500, message: "an error ocurred on import" });
		}
		const insertedExpenses = await Expense.insertMany(myConvertedExpenses, { ordered: false });
		//console.log("after insert", insertedExpenses);
		const imported_expenses = insertedExpenses.length;
		if (imported_expenses > 0 ) {
			res.status(200).json({ status: "success", imported_expenses });
			return;
		} else {
			throw new Error("couldn't import any items")
		}

	} catch (err) {
		console.error("error in import from source", err);
		if (err.toString().includes("couldn't import any items")) {
			res
			.status(500)
			.json({ code: 500, message: "could not import any of those expenses, maybe there is an error with the source file or our systems. Get in touch with our support team for help" });
		return;
		}
		if (
			err?.reason?.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (typeof err?.code === "string" &&  err?.code?.includes("CSV_")) {
			res.status(400).json({
				code: 400,
				reason: "csv parsing error",
				message:
					`There was an error parsing the provided csv, ${err.toString()}`,
			}).end();
			return;
		}
		if (err.code === 11000) {
			console.log(err)
			const imported_expenses = err.insertedDocs.length
			const skipped_records = err.writeErrors.length
			if (imported_expenses > 0) {
				res.status(200).json({status: "success", imported_expenses, skipped_records,message: "some records were skipped as there are already records with the same unique transaction ID" }).end()
			}
			res.status(400).json({
				code: 400,
				reason: "duplicate_keys",
				message:
					"all records were skipped because there are already records with the same unique transaction ID",
				skipped_records
			}).end();
			return;
		}
		next(err);
	}
});

router.delete("/:sourceId", isAuthenticated, async (req, res, next) => {
	const { _id: user_id } = req.payload;
	const { sourceId } = req.params;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}

		if (source.created_by_user_id.toString() !== user_id && source.public) {
			// leaving this separate in case we want to change it to an unauthenticated error later
			res
				.status(401)
				.json({ code: 401, message: "you do not have the authorata" });
			return;
		}

		if (source.created_by_user_id.toString() !== user_id) {
			// leaving this as separate in case we want to change auth error later
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		const deletedSource = await Source.findByIdAndDelete(sourceId);
		res.status(204).end();
		return;
	} catch (err) {
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		console.error("error in delete source by ID", err);
		next(err);
	}
});

module.exports = router;
