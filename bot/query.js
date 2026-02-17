import bot from "./bot.js";
import {
  addCategory,
  editCategory,
  paginationCategory,
  removeCategory,
  showCategory,
} from "./helpers/category.js";
import {
  changeOrderStatus,
  readyOrder,
  showLocation,
} from "./helpers/order.js";
import { addProduct, deleteProduct, showProduct } from "./helpers/product.js";

bot.on("callback_query", async (query) => {
  const { data } = query;
  const chat_id = query.from.id;
  const message_id = query?.message?.message_id;

  console.log("query-data", data);

  await bot.answerCallbackQuery(query.id);

  if (data === "add_category") {
    addCategory(chat_id);
  }

  if (data.includes("order_product-")) {
    const id = data.split("-")[1];
    const count = +data.split("-")[2];
    readyOrder(chat_id, id, count);
  }

  if (data.includes("map_order-")) {
    const id = data.split("-")[1];
    showLocation(chat_id, id);
    return;
  }

  if (data.includes("cancel_order-")) {
    const id = data.split("-")[1];
    changeOrderStatus(chat_id, id, 2);
    return;
  }

  if (data.includes("success_order-")) {
    const id = data.split("-")[1];
    changeOrderStatus(chat_id, id, 3);
    return;
  }

  if (data.includes("more_count-")) {
    const id = data.split("-")[1];
    const count = data.split("-")[2];
    showProduct(chat_id, id, +count + 1, message_id);
  }

  if (data.includes("less_count-")) {
    const id = data.split("-")[1];
    const count = data.split("-")[2];
    if (+count > 1) {
      showProduct(chat_id, id, +count - 1, message_id);
    }
  }

  if (["back_category", "next_category"].includes(data)) {
    paginationCategory(chat_id, data, message_id);
  }

  if (data.includes("category_")) {
    const id = data.split("_")[1];
    showCategory(chat_id, id);
  }

  if (data.includes("delete_category-")) {
    const id = data.split("-")[1];
    removeCategory(chat_id, id);
  }

  if (data.includes("edit_category-")) {
    const id = data.split("-")[1];
    editCategory(chat_id, id);
  }

  if (data.includes("add_product-")) {
    const id = data.split("-")[1];
    addProduct(chat_id, id);
  }

  if (data.includes("product_")) {
    const id = data.split("_")[1];
    showProduct(chat_id, id);
  }

  if (data.includes("delete_product-")) {
    const id = data.split("-")[1];
    deleteProduct(chat_id, id);
  }

  if (data.includes("remove_product-")) {
    const id = data.split("-")[1];
    deleteProduct(chat_id, id, true);
  }
});
