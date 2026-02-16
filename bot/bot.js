import TELEGRAM_BOT from "node-telegram-bot-api";
import ENV from "../configs/env.js";

const bot = new TELEGRAM_BOT(ENV.BOT_TOKEN, { polling: true });

import("./message.js");
import("./query.js");

export default bot;
