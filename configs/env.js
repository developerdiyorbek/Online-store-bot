import getEnv from "../utils/getEnv.js";

const ENV = {
  BOT_TOKEN: getEnv("BOT_TOKEN", { required: true }),
  MONGOGB_URI: getEnv("MONGOGB_URI", { required: true }),
  PORT: getEnv("PORT", { required: true }),
  CLIENT_URL: getEnv("CLIENT_URL", { required: true }),
};

export default ENV;
