function errorHandler(err, req, res, next) {
	console.error("Error", req.method, req.path, err);

	// Check if the response was already sent, as sending a response twice for the same request will cause an error.
	if (!res.headersSent) {
		res
			.status(500)
			.json({ message: "Internal server error, Check the server console" });
	}
}

function notFoundHandler(req, res, next) {
	res.status(404).json({ message: "This route does not exist." });
}

function isAuthenticatedWithErrorHandler(err, req, res, next) {
	if (err && err.name === "UnauthorizedError") {
		// Token expired, return a 401 Unauthorized error
		return res.status(401).json({ message: "Token expired" });
	}
	next(err);
}
module.exports = {
	errorHandler,
	notFoundHandler,
	isAuthenticatedWithErrorHandler,
};
