import "dotenv/config";
import express from "express";
import ENV from "./configs/env.js";
import connectDB from "./configs/connectDB.js";

const app = express();

app.use(express.json());

import "./bot/bot.js";

async function start() {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

start();
