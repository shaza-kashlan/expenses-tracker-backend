const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense.model.js");
const { isAuthenticated } = require("../middleware/jwt.middleware");

//************* Get all expenses ***********
router.get("/", isAuthenticated, (req, res) => {
  Expense.find()
    .then((allxpenses) => {
      res.status(200).json(allxpenses);
    })
    .catch((err) => {
      res.status(500).json({ message: "Error while getting all expenses" });
    });
});

//************* Get expense by Id ***********
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ massage: "expense not found" });
    } else {
      return res.status(200).json({ message: "expense found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
