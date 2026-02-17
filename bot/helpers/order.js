import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";
import bot from "../bot.js";

const readyOrder = async (chat_id, product_id, count) => {
  const user = await UserModel.findOne({ chat_id });
  const product = await ProductModel.findById(product_id).lean();

  const draftOrder = await OrderModel.findOne({ user: user._id, status: 0 });
  if (draftOrder) {
    await OrderModel.deleteMany({ user: user._id, status: 0 });
  }

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: "order" },
    { returnDocument: "after" },
  );

  const order = new OrderModel({
    user: user._id,
    product: product._id,
    count,
    status: 0,
  });

  await order.save();

  bot.sendMessage(
    chat_id,
    "Mahsulotni buyurtma qilish uchun dostavka manzilini jo'nating",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Lokatsiyani jo'natish",
              request_location: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    },
  );
};

const endOrder = async (chat_id, location) => {
  const user = await UserModel.findOne({ chat_id });
  const admin = await UserModel.findOne({ admin: true });
  const order = await OrderModel.findOne({
    user: user._id,
    status: 0,
  }).populate("product");

  await UserModel.findByIdAndUpdate(
    user._id,
    { action: "end-order" },
    { returnDocument: "after" },
  );

  if (order) {
    order.location = location;
    order.status = 1;
    await order.save();

    bot.sendMessage(
      chat_id,
      "Buyurtma qabul qilindi. Tez orada sizga bog'lanamiz",
      {
        reply_markup: {
          remove_keyboard: true,
        },
      },
    );

    bot.sendMessage(
      admin.chat_id,
      `Buyurtma qabul qilindi. Mahsulot: ${order.product.title}\nSoni: ${order.count}\nManzil: ${location.latitude}, ${location.longitude}\n Umumiy narxi: ${order.product.price * order.count} so'm`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Buyurtmani bekor qilish",
                callback_data: `cancel_order-${order._id}`,
              },
              {
                text: "Qabul qilish",
                callback_data: `success_order-${order._id}`,
              },
            ],
            [
              {
                text: "Lokatsiyani olish",
                callback_data: `map_order-${order._id}`,
              },
            ],
          ],
        },
      },
    );
  }
};

const showLocation = async (chat_id, order_id) => {
  const user = await UserModel.findOne({ chat_id });
  if (user.admin) {
    const order = await OrderModel.findById(order_id);
    const location = order.location;
    bot.sendLocation(chat_id, location.latitude, location.longitude);
  } else {
    bot.sendMessage(chat_id, "Sizga bunday so'rov mumkin emas");
  }
};

const changeOrderStatus = async (chat_id, order_id, status) => {
  const user = await UserModel.findOne({ chat_id });
  if (user.admin) {
    const order = await OrderModel.findById(order_id).populate("product user");
    await OrderModel.findByIdAndUpdate(
      order_id,
      { status },
      { returnDocument: "after" },
    );
    const msg =
      status === 2 ? "Buyurtma bekor qilindi" : "Buyurtma qabul qilindi";
    bot.sendMessage(order.user.chat_id, msg);
    bot.sendMessage(chat_id, "Buyurtma statusi o'zgartirildi");
  } else {
    bot.sendMessage(chat_id, "Sizga bunday so'rov mumkin emas");
  }
};

export { readyOrder, endOrder, showLocation, changeOrderStatus };
