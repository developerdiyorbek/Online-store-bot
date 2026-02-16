import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: String,
    chat_id: Number,
    phone_number: String,
    admin: {
      type: Boolean,
      default: false,
    },
    action: String,
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
