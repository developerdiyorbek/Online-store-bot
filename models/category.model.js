import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    title: String,
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
