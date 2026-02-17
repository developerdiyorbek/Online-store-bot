import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: String,
    price: Number,
    image: String,
    description: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// 1 - title
// 2 - price
// 3 - image
// 4 - description

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
