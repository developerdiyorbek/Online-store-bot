import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    count: Number,
    price: Number,
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
