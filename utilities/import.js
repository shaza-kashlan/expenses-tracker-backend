/*
- Import some csv data
- Convert to array of expense format
- Return array so can be inserted
*/
const { parse } = require("csv/sync");

const csvToJson = (csv, separator = ",") => {
	const records = parse(csv, {
		columns: true,
		skip_empty_lines: true,
		delimiter: separator,
	});

	return records;
};

// const testMapping = {
// 	date: "Buchungsdatum",
// 	description: "Beschreibung",
// 	notes: "",
// 	amount: "Originalbetrag",
// 	payee: "",
// };

const csvToExpense = (
	user_id,
	data = "",
	separator = ",",
	mapping = {},
	type = "cash",
	number_style = "normal",
) => {
	if (!user_id) {
		console.error("no user id provided for import");
		return null;
	}

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
				let amount = element[mapping[key]];
				if (number_style === "german") {
					amount = amount.replace(".", "").replace(",", ".");
				}
				amount = amount
					.replace("+", "")
					.replace("€", "")
					.replaceAll('"', "")
					.trim();
				newObj[key] = amount;
				continue;
			}
			if (key === "date") {
				newObj[key] = element[mapping[key]].replaceAll(".", "-");
			} else {
				newObj[key] = element[mapping[key]];
			}
		}
		return newObj;
	});
	return expenseArr;
};

module.exports = { csvToExpense };
