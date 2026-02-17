import UserModel from "../../models/user.model.js";
import bot from "../bot.js";
import { adminKeyboard, userKeyboard } from "../menu/keyboard.js";

async function start(msg) {
  const chat_id = msg.from.id;

  const user = await UserModel.findOne({ chat_id }).lean();

  if (!user) {
    await UserModel.create({
      chat_id,
      name: msg.from.first_name,
      admin: false,
      status: true,
      action: "request_contact",
    });

    bot.sendMessage(
      chat_id,
      `Assalomu alaykum, ${msg.from.first_name}!, Chatga kirish uchun telefon raqamingizni ulashing`,
      {
        reply_markup: {
          keyboard: [
            [{ text: "Telefon raqamingizni ulash", request_contact: true }],
          ],
          resize_keyboard: true,
        },
      },
    );
  } else {
    await UserModel.findOneAndUpdate(
      { chat_id },
      { action: "menu" },
      { returnDocument: "after" },
    );

    bot.sendMessage(
      chat_id,
      `Assalomu alaykum, ${user.admin ? "Admin" : user.name} menyuni tanlang`,
      {
        reply_markup: {
          keyboard: user.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      },
    );
  }
}

async function requestContact(msg) {
  const chat_id = msg.from.id;

  if (msg.contact.phone_number) {
    const user = await UserModel.findOne({ chat_id });
    user.phone_number = msg.contact.phone_number;
    user.action = "menu";
    user.admin = msg.contact.phone_number === "998936221907";
    await user.save();

    bot.sendMessage(
      chat_id,
      `Assalomu alaykum, ${user.admin ? "Admin" : user.name} menyuni tanlang`,
      {
        reply_markup: {
          keyboard: user.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      },
    );
  }
}

export { start, requestContact };
