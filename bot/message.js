import UserModel from "../models/user.model.js";
import bot from "./bot.js";
import {
  getAllCategories,
  newCategory,
  saveCategory,
} from "./helpers/category.js";
import { addProductNext } from "./helpers/product.js";
import { start, requestContact } from "./helpers/start.js";
import { getAllUsers } from "./helpers/users.js";

bot.on("message", async (msg) => {
  const chat_id = msg.from.id;
  const text = msg.text;
  console.log("message-text", text);

  const user = await UserModel.findOne({ chat_id }).lean();

  if (text === "/start") {
    start(msg);
  }

  if (user) {
    if (user.action === "request_contact" && !user.phone_number) {
      requestContact(msg);
    }

    if (text === "Foydalanuvchilar") {
      getAllUsers(msg);
      return;
    }

    if (text === "Katalog") {
      getAllCategories(chat_id);
      return;
    }

    if (user.action === "add_category") {
      newCategory(msg);
    }

    if (user.action.includes("edit_category-")) {
      const id = user.action.split("-")[1];
      saveCategory(chat_id, text);
    }

    if (user.action === "new_product_title") {
      addProductNext(chat_id, text, "title");
    }

    if (user.action === "new_product_price") {
      addProductNext(chat_id, text, "price");
    }

    if (user.action === "new_product_image") {
      if (msg.photo) {
        const file_id = msg.photo.at(-1).file_id;
        addProductNext(chat_id, file_id, "image");
      } else {
        bot.sendMessage(chat_id, "Mahsulot rasmini rasm formatida yuklang");
      }
    }

    if (user.action === "new_product_description") {
      addProductNext(chat_id, text, "description");
    }
  }
});
