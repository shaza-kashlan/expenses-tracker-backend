/*
- Import some csv data
- Convert to array of expense format
- Return array so can be inserted
*/
const { parse: parseCSV } = require("csv/sync");
const {parse: parseDate, format} = require("date-fns")
const {runThroughLexer, createLexerSet} = require("./lexer")

const Category = require("../models/Category.model");

const getPatterns = async () => {
	console.log('finding')
	const patterns = await Category.find({patterns:{ $exists: true,$ne: []}},{patterns: 1,name:1, _id: {
        $toString: "$_id"
      }})
	//console.log(patterns)
	const patternsObj = patterns.reduce((acc,category) => {
		return {...acc,[category._id]: category.patterns}
	},{})
	//console.log(patternsObj)
	return patternsObj
}


const csvToJson = (csv, separator = ",") => {
	const records = parseCSV(csv, {
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


const wrangleDateFormat = (dateString, dateFormat) => {
	if (dateFormat.toLowerCase() === "YYYY-MM-DD") {
		return dateString
	}
	
	const parsedDate = format(parseDate(dateString, dateFormat.toLowerCase(), new Date()),'yyyy-mm-dd')
	
	return parsedDate
}

//console.log(wrangleDateFormat('29.03.2024', 'dd.mm.yyyy'))

const csvToExpense = async (
	user_id,
	source_id,
	data = "",
	separator = ",",
	mapping = {},
	type = "cash",
	number_style = "normal",
	date_format = "",
	autocategorise = true
) => {
	if (!user_id) {
		console.error("no user id provided for import");
		return null;
	}
	console.log('date f',date_format)
	const myArr = csvToJson(data, separator);
	const patterns = await getPatterns()
	const patternsObj = createLexerSet(patterns)

	const expenseArr = myArr.map((element) => {
		const newObj = {
			payment_method: type,
			created_by_user_id: user_id,
			source: source_id,
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
				//console.log('df', date_format)
				if (date_format) {
					newObj[key] = wrangleDateFormat(element[mapping[key]], date_format)
				} else {
					console.log("didn't get a date format, I hope this is yyyy-mm-dd, or there might be issues", element[mapping[key]])
					newObj[key] = element[mapping[key]]
				}
				
			} if (key === "description" && autocategorise) {
				newObj[key] = element[mapping[key]];
				newObj.category = runThroughLexer(element[mapping[key]],patternsObj);
			}
			
			else {
				newObj[key] = element[mapping[key]];
			}
		}
		return newObj;
	});
	return expenseArr;
};

module.exports = { csvToExpense };
