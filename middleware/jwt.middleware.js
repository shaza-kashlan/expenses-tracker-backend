const { expressjwt: jwt } = require("express-jwt");

function getTokenFromHeaders(req, res, next) {
	console.log("\n\ntoken autorize\n\n");
	// Check if the token is available on the request Headers
	if (
		req.headers.authorization &&
		req.headers.authorization.split(" ")[0] === "Bearer"
	) {
		console.log(
			"\n\n token autorize in condition \n \n",
			req.headers.authorization,
		);

		const token = req.headers.authorization.split(" ")[1];

		console.log("\n\n token \n \n", token);
		return token;
	}
	return null;
}

const isAuthenticated = jwt({
	secret: process.env.TOKEN_SECRET,
	algorithms: ["HS256"],
	requestProperty: "payload",
	getToken: getTokenFromHeaders,
});

// Middleware function to handle authentication errors
function isAuthenticatedWithErrorHandler(err, req, res, next) {
	if (
		err &&
		err.name === "UnauthorizedError"
		// err.inner.name === "TokenExpiredError"
	) {
		// Token expired, return a 401 Unauthorized error
		return res
			.status(401)
			.json({ message: "Unauthorized Action Please Log in " });
	}
	next(err);
}

// Export the isAuthenticated middleware
module.exports = {
	isAuthenticated: (req, res, next) => {
		isAuthenticated(req, res, (err) => {
			isAuthenticatedWithErrorHandler(err, req, res, next);
		});
	},
};
