import UserModel from "../models/user.model.js";
import bot from "./bot.js";
import {
  getAllCategories,
  newCategory,
  saveCategory,
} from "./helpers/category.js";
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
    }

    if (text === "Katalog") {
      getAllCategories(chat_id);
    }

    if (user.action === "add_category") {
      newCategory(msg);
    }

    if (user.action.includes("edit_category-")) {
      const id = user.action.split("-")[1];
      saveCategory(chat_id, text);
    }
  }
});
