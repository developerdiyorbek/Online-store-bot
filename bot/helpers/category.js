import CategoryModel from "../../models/category.model.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";
import bot from "../bot.js";
import { clearDraftProduct } from "./product.js";

const getAllCategories = async (chat_id, page = 1, message_id = null) => {
  clearDraftProduct(chat_id); // draft mahsulotlarni tozalash

  const user = await UserModel.findOne({ chat_id });

  let limit = 5;
  let skip = (page - 1) * limit;

  if (page === 1 && skip > 0) {
    await UserModel.findByIdAndUpdate(
      user._id,
      { action: "category-1" },
      { returnDocument: "after" },
    );
  }

  const categories = await CategoryModel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (categories.length == 0) {
    page--;

    await UserModel.findByIdAndUpdate(
      user._id,
      { action: `category-${page}` },
      { returnDocument: "after" },
    );

    getAllCategories(chat_id, page);

    return;
  }

  const lists = categories.map((category) => [
    {
      text: category.title,
      callback_data: `category_${category._id}`,
    },
  ]);

  const inline_keyboard = [
    ...lists,
    [
      {
        text: "Orqaga",
        callback_data: page > 1 ? "back_category" : page,
      },
      {
        text: page,
        callback_data: `${page}`,
      },
      {
        text: "Keyingi",
        callback_data: limit == categories.length ? "next_category" : page,
      },
    ],
    user?.admin
      ? [
          {
            text: "Yangi kategoriya qo'shish",
            callback_data: "add_category",
          },
        ]
      : [],
  ];

  if (message_id > 0) {
    bot.editMessageReplyMarkup(
      { inline_keyboard },
      {
        chat_id,
        message_id,
      },
    );
  } else {
    bot.sendMessage(chat_id, `Kataloglar ro'yxati`, {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard,
      },
    });
  }
};

const addCategory = async (chat_id) => {
  const user = await UserModel.findOne({ chat_id });

  if (user.admin) {
    user.action = "add_category";
    await user.save({ new: true });

    bot.sendMessage(chat_id, "Yangi kategoriya nomini kiriting");
  } else {
    bot.sendMessage(chat_id, "Sizga bunday so'rov mumkin emas");
  }
};

const newCategory = async (msg) => {
  console.log(msg);
  const chat_id = msg.from.id;
  const text = msg.text;
  const user = await UserModel.findOne({ chat_id });

  if (user.admin && user.action === "add_category") {
    await CategoryModel.create({ title: text });
    await UserModel.findByIdAndUpdate(
      user._id,
      { action: "category" },
      { returnDocument: "after" },
    );

    getAllCategories(chat_id);
  } else {
    bot.sendMessage(chat_id, "Sizga bunday so'rov mumkin emas");
  }
};

const paginationCategory = async (chat_id, action, message_id = null) => {
  const user = await UserModel.findOne({ chat_id });
  let page = 1;

  if (user.action.includes("category-")) {
    page = +user.action.split("-")[1];

    if (action === "back_category" && page > 1) {
      page--;
    }
  }
  if (action === "next_category") {
    page++;
  }

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: `category-${page}` },
    { returnDocument: "after" },
  );

  getAllCategories(chat_id, page, message_id);
};

const showCategory = async (chat_id, category_id, page = 1) => {
  const user = await UserModel.findOne({ chat_id });
  const category = await CategoryModel.findById(category_id).lean();

  if (!category) {
    bot.sendMessage(chat_id, "Kategoriya topilmadi.");
    return getAllCategories(chat_id, 1);
  }

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: `category_${category._id}` },
    { returnDocument: "after" },
  );

  let limit = 5;
  let skip = (page - 1) * limit;

  const products = await ProductModel.find({ category: category_id, status: 1 })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const lists = products.map((product) => [
    {
      text: product.title,
      callback_data: `product_${product._id}`,
    },
  ]);

  const adminKeyboard = [
    [
      {
        text: "Yangi mahsulot",
        callback_data: `add_product-${category._id}`,
      },
    ],
    [
      {
        text: "Turkumni tahrirlash",
        callback_data: `edit_category-${category._id}`,
      },
      {
        text: "Turkumni o'chirish",
        callback_data: `delete_category-${category._id}`,
      },
    ],
  ];

  const keyboards = user?.admin ? adminKeyboard : [];

  bot.sendMessage(
    chat_id,
    `${category.title} turkumidagi mahsulotlar ro'yxati`,
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [
          ...lists,
          [
            {
              text: "Orqaga",
              callback_data: page > 1 ? "back_product" : page,
            },
            {
              text: page,
              callback_data: `${page}`,
            },
            {
              text: "Keyingi",
              callback_data: limit == products.length ? "next_product" : page,
            },
          ],
          ...keyboards,
        ],
      },
    },
  );
};

const removeCategory = async (chat_id, category_id) => {
  const user = await UserModel.findOne({ chat_id });
  const category = await CategoryModel.findById(category_id).lean();

  if (user.action !== "delete_category") {
    await UserModel.findByIdAndUpdate(
      user._id,
      { action: `delete_category` },
      { returnDocument: "after" },
    );

    bot.sendMessage(
      chat_id,
      `Siz ${category.title} turkumini o'chirmoqchimisiz?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Bekor qilish",
                callback_data: `category_${category._id}`,
              },
              {
                text: "O'chirish",
                callback_data: `delete_category-${category_id}`,
              },
            ],
          ],
        },
      },
    );
  } else {
    await ProductModel.deleteMany({ category: category_id });
    await CategoryModel.findByIdAndDelete(category._id);

    bot.sendMessage(
      chat_id,
      `${category.title} turkumini o'chirildi, Menyudan tanlang`,
    );
  }
};

const editCategory = async (chat_id, category_id) => {
  const user = await UserModel.findOne({ chat_id });
  const category = await CategoryModel.findById(category_id).lean();
  await UserModel.findByIdAndUpdate(
    user._id,
    { action: `edit_category-${category_id}` },
    { returnDocument: "after" },
  );

  bot.sendMessage(chat_id, `${category.title} turkumga yangi nom kiriting`);
};

const saveCategory = async (chat_id, title) => {
  const user = await UserModel.findOne({ chat_id });
  let category_id = user.action.split("-")[1];

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: "menu" },
    { returnDocument: "after" },
  );

  await CategoryModel.findByIdAndUpdate(
    category_id,
    { title: title },
    { returnDocument: "after" },
  );
  bot.sendMessage(chat_id, `Turkum yangilandi. Menyudan tanlang`);
};

export {
  getAllCategories,
  addCategory,
  newCategory,
  paginationCategory,
  showCategory,
  removeCategory,
  editCategory,
  saveCategory,
};
