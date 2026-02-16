import UserModel from "../../models/user.model.js";
import bot from "../bot.js";
import { userKeyboard } from "../menu/keyboard.js";

async function getAllUsers(msg) {
  const chat_id = msg.from.id;
  const user = await UserModel.findOne({ chat_id });

  if (user.admin) {
    const users = await UserModel.find({}).lean();

    bot.sendMessage(
      chat_id,
      `Foydalanuvchilar ro'yxati,
      ${users.map((user) => `${user.name} - ${user.chat_id}`)}\n`,
    );
  } else {
    bot.sendMessage(chat_id, "Sizga bunday so'rov mumkin emas", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
  }
}

export { getAllUsers };
