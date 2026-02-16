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
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
