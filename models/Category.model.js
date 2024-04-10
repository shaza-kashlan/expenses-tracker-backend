const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    parent_category: { type: Schema.Types.ObjectId, ref: "Category" },
    icon: { type: Schema.Types.ObjectId, ref: "Icon" },
    public: { type: Boolean, default: true },
    created_by_user_id: { type: Schema.Types.ObjectId, ref: "User" },
    patterns: {type: [String]}
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

categorySchema.methods.toJSON = function () {
  const { created_by_user_id, ...categoryToReturn } = this._doc;

  return categoryToReturn;
};

const Category = model("Category", categorySchema);

module.exports = Category;
