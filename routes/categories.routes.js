const express = require("express");
const router = express.Router();
const Category = require("../models/Category.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const FAKE_USER_ID = { _id: "660d205410464d8fa79a3fef" };

// TODO: add auth middleware when available

router.get("/", isAuthenticated, async (req, res, next) => {
  const { _id: user_id } = req.payload || FAKE_USER_ID;
  const { include_parents } = req.query;

  try {
    const categories = await Category.find({
      $or: [{ created_by_user_id: user_id }, { public: true }],
    }).populate(include_parents === "true" ? "parent_category" : "");
    res.status(200).json(categories);
  } catch (err) {
    console.error("error in get all categories", err);
    next(err);
  }
});

router.post("/", isAuthenticated, async (req, res, next) => {
  const { _id: user_id } = req.payload || FAKE_USER_ID;
  const newCategoryBody = req.body;
  newCategoryBody.created_by_user_id = user_id || FAKE_USER_ID;

  // TODO: handle create icon if included, create mappings if included
  try {
    const newCategory = await Category.create(newCategoryBody);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error("got an error creating a category", err);
    if (err.toString().includes("E11000 duplicate key error")) {
      res.status(400).json({
        code: 400,
        reason: "duplicate_key",
        message:
          "there is already a category with that name, please try again with something a little more unique",
      });
      return;
    }
    if (err._message === "Category validation failed") {
      res.status(400).json({
        code: 400,
        reason: "validation_failed",
        message: `${err.toString().split("Category validation failed:")}`,
      });
      return;
    }

    next(err);
  }
});

router.get("/:categoryId", isAuthenticated, async (req, res, next) => {
  const { _id: user_id } = req.payload || FAKE_USER_ID;
  const { categoryId } = req.params;
  const { include_parents } = req.query;
  try {
    const category = await Category.findById(categoryId).populate(
      include_parents === "true" ? "parent_category" : ""
    );
    if (!category) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }
    if (
      category.created_by_user_id.toString() !== user_id &&
      !category.public
    ) {
      console.log(
        "testing",
        category.created_by_user_id.toString() !== user_id
      );
      console.log("category", category.created_by_user_id.toString());
      console.log("userid", user_id);
      res
        .status(401)
        .json({ code: 401, message: "you do not have the autharata" });
      return;
    }

    res.status(200).json(category);
    return;
  } catch (err) {
    if (
      err.reason.toString() ===
      "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
    ) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }
    console.error("error in find category by ID", err);
    next(err);
  }
});

router.put("/:categoryId", async (req, res, next) => {
  const { _id: user_id } = req.payload || FAKE_USER_ID;
  const { categoryId } = req.params;
  const updatedVersion = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }

    if (category.created_by_user_id.toString() !== user_id) {
      res
        .status(401)
        .json({ code: 401, message: "you do not have the autharata" });
      return;
    }
    // TODO: handle required fields and other issues that would cause a 400 error because mongoose does not
    // for example, changing the name to something that already exists
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updatedVersion,
      { new: true }
    );
    res.status(201).json(updatedCategory);
    return;
  } catch (err) {
    if (
      err?.reason?.toString() ===
      "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
    ) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }
    if (err.toString().includes("E11000 duplicate key error")) {
      res.status(400).json({
        code: 400,
        reason: "duplicate_key",
        message:
          "there is already a category with that name, please try again with something a little more unique",
      });
      return;
    }
    console.error("error in update category by ID", err);
    next(err);
  }
});

router.delete("/:categoryId", async (req, res, next) => {
  const { _id: user_id } = req.payload || FAKE_USER_ID;
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }
    if (
      category.created_by_user_id.toString() !== user_id &&
      !category.public
    ) {
      res
        .status(401)
        .json({ code: 401, message: "you do not have the autharata" });
      return;
    }
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    res.status(204).end();
    return;
  } catch (err) {
    if (
      err.reason.toString() ===
      "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
    ) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a category with that ID" });
      return;
    }
    console.error("error in delete category by ID", err);
    next(err);
  }
});

module.exports = router;
