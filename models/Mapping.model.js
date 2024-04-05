const { Schema, model } = require("mongoose");

const mappingSchema = new Schema({
	date: { type: String, default: "" },
	description: { type: String, default: "" },
	notes: { type: String, default: "" },
	amount: { type: String, default: "" },
	payee: { type: String, default: "" },
});

mappingSchema.methods.toJSON = function () {
	const { _id, ...mappingToReturn } = this._doc;

	return mappingToReturn;
};

const Mapping = model("Mapping", mappingSchema);

module.exports = { Mapping, mappingSchema };
