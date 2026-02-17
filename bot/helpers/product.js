import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";
import bot from "../bot.js";

const steps = {
  title: {
    action: "new_product_price",
    message: "Mahsulot narxini kiriting",
  },
  price: {
    action: "new_product_image",
    message: "Mahsulot rasmini yuklang",
  },
  image: {
    action: "new_product_description",
    message: "Mahsulot ma'lumotini kiriting",
  },
};

const addProduct = async (chat_id, category_id) => {
  const user = await UserModel.findOne({ chat_id });

  const newProduct = new ProductModel({
    category: category_id,
    status: 0,
  });
  await newProduct.save();

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: `new_product_title` },
    { returnDocument: "after" },
  );

  bot.sendMessage(chat_id, "Yangi mahsulot nomini kiriting");
};

const addProductNext = async (chat_id, value, slug) => {
  const user = await UserModel.findOne({ chat_id });
  const product = await ProductModel.findOne({ status: 0 }).lean();

  if (["title", "description", "price", "image"].includes(slug)) {
    product[slug] = value;

    if (slug === "description") {
      product.status = 1;

      await UserModel.findByIdAndUpdate(
        user._id,
        { action: "menu" },
        { returnDocument: "after" },
      );

      bot.sendMessage(chat_id, "Mahsulot muvaffaqiyatli qo'shildi");
    } else {
      await UserModel.findByIdAndUpdate(
        user._id,
        { action: steps[slug].action },
        { returnDocument: "after" },
      );

      bot.sendMessage(chat_id, steps[slug].message);
    }

    await ProductModel.findByIdAndUpdate(product._id, product, {
      returnDocument: "after",
    });
  }
};

const clearDraftProduct = async (chat_id) => {
  const products = await ProductModel.find({ status: 0 }).lean();
  if (products.length > 0) {
    await ProductModel.deleteMany({ status: 0 });
  }
};

const showProduct = async (chat_id, product_id) => {
  const user = await UserModel.findOne({ chat_id });
  const product = await ProductModel.findById(product_id)
    .populate("category")
    .lean();

  bot.sendPhoto(chat_id, product.image, {
    caption: `<b>${product.title}</b>\n📦 Turkum: ${product.category.title}\n🌿 Narhi: ${product.price} so'm\n🔥 Qisqa ma'lumoti: ${product.description}`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "➖", callback_data: "less_count" },
          { text: "1", callback_data: "1" },
          { text: "➕", callback_data: "more_count" },
        ],
        user.admin
          ? [
              {
                text: "✏️ Tahrirlash",
                callback_data: `edit_product-${product_id}`,
              },
              {
                text: "🗑️ O'chirish",
                callback_data: `delete_product-${product_id}`,
              },
            ]
          : [],
        [
          {
            text: "🛒 Korzinkaga qo'shish",
            callback_data: "add_cart",
          },
        ],
      ],
    },
  });
};

const deleteProduct = async (chat_id, product_id, sure = false) => {
  const user = await UserModel.findOne({ chat_id });
  const product = await ProductModel.findById(product_id).lean();

  if (user.admin) {
    if (sure) {
      await ProductModel.findByIdAndDelete(product_id);
      bot.sendMessage(chat_id, `${product.title} mahsulotini o'chirildi`);
    } else {
      bot.sendMessage(
        chat_id,
        `Siz ${product.title} mahsulotini o'chirmoqchimisiz?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "❌ Bekor qilish",
                  callback_data: `product_${product_id}`,
                },
                {
                  text: "✅ Ha",
                  callback_data: `remove_product-${product_id}`,
                },
              ],
            ],
          },
        },
      );
    }
  }
};

export {
  addProduct,
  addProductNext,
  clearDraftProduct,
  showProduct,
  deleteProduct,
};
