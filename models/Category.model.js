const { Schema, model } = require("mongoose");

//
const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "name of category is required."],
  },
  description: {
    type: String,
    required: [true, "description of category is required."],
  },
  icon: {
    type: Schema.Types.ObjectId,
    ref: "Icon",
  },
  parent_category: {
    type: String,
  },
  public: {
    type: Boolean,
  },
});

const Category = model("Category", categorySchema);
module.exports = Category;
