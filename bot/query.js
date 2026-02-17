import bot from "./bot.js";
import {
  addCategory,
  editCategory,
  paginationCategory,
  removeCategory,
  showCategory,
} from "./helpers/category.js";
import { addProduct, deleteProduct, showProduct } from "./helpers/product.js";

bot.on("callback_query", async (query) => {
  const { data } = query;
  const chat_id = query.from.id;
  console.log("query-message", data);

  if (data === "add_category") {
    addCategory(chat_id);
  }

  if (["back_category", "next_category"].includes(data)) {
    paginationCategory(chat_id, data);
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
