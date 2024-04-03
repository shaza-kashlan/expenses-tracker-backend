const express = require("express");
const router = express.Router();
const Source = require("../models/Source.model");
const FAKE_USER_ID = { _id: "660d205410464d8fa79a3fef" };

// TODO: add auth middleware when available

router.get("/", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;

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

router.post("/", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const newSourceBody = req.body;
	newSourceBody.created_by_user_id = user_id || FAKE_USER_ID;

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

router.get("/:sourceId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { sourceId } = req.params;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id.toString() !== user_id) {
			console.log("testing", source.created_by_user_id.toString() !== user_id);
			console.log("source", source.created_by_user_id.toString());
			console.log("userid", user_id);
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
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

router.put("/:sourceId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
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
		if (source.created_by_user_id !== user_id) {
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
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
		if (
			err.reason.toString() ===
			"BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
		) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		console.error("error in update source by ID", err);
		next(err);
	}
});

router.delete("/:sourceId", async (req, res, next) => {
	const { _id: user_id } = req.payload || FAKE_USER_ID;
	const { sourceId } = req.params;

	try {
		const source = await Source.findById(sourceId);
		if (!source) {
			res
				.status(404)
				.json({ code: 404, message: "could not find a source with that ID" });
			return;
		}
		if (source.created_by_user_id !== user_id && !source.public) {
			res
				.status(401)
				.json({ code: 401, message: "you do not have the autharata" });
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
