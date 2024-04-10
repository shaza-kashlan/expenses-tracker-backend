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
app.use(express.static('public'))

app.get("/", (req,res) => {
    res.sendFile(__dirname + '/views/index.html')
} )

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/users", authRoutes);

const categoriesRouter = require("./routes/categories.routes");
app.use("/categories", categoriesRouter);

const expenseRoutes = require("./routes/expenses.routes");
app.use("/expenses", expenseRoutes);

const payeesRoutes = require("./routes/payees.routes");
app.use("/payees", payeesRoutes);

const sourceRouter = require("./routes/sources.routes");
app.use("/sources", sourceRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
