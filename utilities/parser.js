const moo = require("moo");

const bars = ["SISYPHOS", "ZUM STARKEN AUGUST"];
const restaurants = ["McDonald's", "ROCOTO", "BABU"];
const supermarkets = ["EDEKA"];
const travels = ["BVG", "Uber", "Voi"];

const regexPMaker = (element) => `\w*?${element}\w*?`;

const barsRegexp = new RegExp(bars.map(regexPMaker).join("|"));

const lexer = moo.compile({
	bar: new RegExp(bars.map(regexPMaker).join("|")),
	restaurants: new RegExp(restaurants.map(regexPMaker).join("|")),
	supermarkets: new RegExp(supermarkets.map(regexPMaker).join("|")),
	travel: new RegExp(travels.map(regexPMaker).join("|")),
	unknown: /.+?/,
	//   WS:      /[ \t]+/,
	//   comment: /\/\/.*?$/,
	//   number:  /0|[1-9][0-9]*/,
	//   string:  /"(?:\\["\\]|[^\n"\\])*"/,
	//   lparen:  '(',
	//   rparen:  ')',
	//   keyword: ['while', 'if', 'else', 'moo', 'cows'],
	//   NL:      { match: /\n/, lineBreaks: true },
});

lexer.reset("SISYPHOS EVENT GMBH").next()?.type;
lexer.reset("ZUM STARKEN AUGUST     BERLIN        DE").next()?.type;
lexer.reset("McDonald's").next()?.type;
lexer.reset("ROCOTO RESTAURANT").next()?.type;
lexer.reset("Voi").next()?.type;
lexer.reset("Uber").next()?.type;
lexer.reset("some string foo").next().type;
lexer
	.reset(
		"EDEKA Treugut 4247//BERLIN/DE 2024-03-22T12:56:24 KFN 0  VJ 2612 Kartenzahlung",
	)
	.next().type;
