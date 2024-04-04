/*
- Import some csv data
- Convert to array of expense format
- Return array so can be inserted
*/
const fs = require("node:fs");
const { generate, parse, transform, stringify } = require("csv/dist/cjs");
const path = require("node:path");

const testCsv = fs.readFileSync(path.resolve(__dirname, "./umsaetze.csv"), {
	encoding: "utf8",
	flag: "r",
});

const jsonReducer = (headers = [], bodyString = "", separator = ",") => {
	const bodyArr = bodyString.split(separator);
	return headers.reduce((acc, cur, index) => {
		return { ...acc, [cur]: bodyArr[index] };
	}, {});
};

const csvToJson = (csv, separator = ",") => {
	const records = parse(csv, {
		columns: true,
		skip_empty_lines: true,
		group_columns_by_name: true,
	});
	const refinedRecords = transform(records, (data) =>
		data.map((value) => value.toUpperCase()),
	);
	const output = stringify(refinedRecords);
	console.log(output);

	const array = csv.split(/\n|\r/);
	//console.log(array);
	const [headersString, ...body] = array;
	const headers = headersString.split(separator);
	//console.log(headers);
	const toConvert = body.filter((el) => el.length > 0);

	return toConvert.map((element) => jsonReducer(headers, element, separator));
};

const testMapping = {
	date: "Wertstellung",
	description: "Buchungstext",
	notes: "",
	amount: "Betrag",
	payee: "",
};

const csvToExpense = (
	data = "",
	separator = ",",
	mapping = {},
	type = "cash",
	user_id,
) => {
	if (!user_id) {
		console.error("no user id provided for import");
		return null;
	}
	//console.log(separator, mapping, type);
	const myArr = csvToJson(data, separator);

	const expenseArr = myArr.map((element) => {
		const newObj = {
			payment_method: type,
			created_by_user_id: user_id,
		};
		for (const key in mapping) {
			//console.log(key);
			if (!mapping[key]) {
				continue;
			}
			if (key === "amount") {
				newObj[key] = element[mapping[key]]
					.replace(",", ".")
					.replace("+", "")
					.replace("€", "")
					.replaceAll('"', "")
					.trim();
			} else {
				newObj[key] = element[mapping[key]];
			}
		}
		return newObj;
	});
	return expenseArr;
};

const test = csvToExpense(testCsv, ";", testMapping, "bank payment", 123);

console.log(test);

module.exports = { csvToExpense };
