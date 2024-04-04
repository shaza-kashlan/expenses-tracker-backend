// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const cors = require("cors");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

//cors
app.use(cors());

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

//Source routes
const sourceRouter = require("./routes/source.routes");
app.use("/sources", sourceRouter);

const authRoutes = require("./routes/auth.routes");
app.use("/users", authRoutes);

const expenseRoutes = require("./routes/expenses.routes");
app.use("/expenses", expenseRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
