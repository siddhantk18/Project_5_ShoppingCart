const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const ErrorHandler = require("../errorHandler/errorHandlingClass");

exports.checkOut = async (req, res, next) => {
  const data = req.body;
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) {
    return next(new ErrorHandler(404, "No cart exist for this user"));
  }
  if (cart.items.length === 0) {
    return next(
      new ErrorHandler(404, "Please add products in your cart to checkout")
    );
  }
  const carts = JSON.parse(JSON.stringify(cart));

  data.userId = req.params.userId;
  data.items = carts.items;
  data.totalPrice = carts.totalPrice;
  data.totalItems = carts.totalItems;
  if (!data.cancellable) {
    data.cancellable = true;
  }
  data.status = "pending";
  const order = await Order.create(data);

  carts.items.length = 0;
  carts.totalPrice = 0;
  carts.totalItems = 0;
  await Cart.findOneAndUpdate({ userId: req.params.userId }, { $set: carts });
  return res.status(201).send({ status: true, data: order });
};

exports.updateOrder = async (req, res, next) => {
  if (!req.body.status || !req.body.orderId) {
    return next(
      new ErrorHandler(400, "Please provide both status and orderId")
    );
  }
  const { status, orderId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    return next(new ErrorHandler(404, "No order found for this Order Id"));
  }
  if (order.status === "completed") {
    return next(
      new ErrorHandler(400, "Order is completed, cannot update status now")
    );
  }
  if (order.status === "cancled") {
    return next(
      new ErrorHandler(400, "Order is cancelled, cannot update status now")
    );
  }
  if (status === "completed") {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status } },
      { new: true }
    );
    if (!updatedOrder) {
      return next(new ErrorHandler(404, "No order found for this order ID"));
    }
    return res.status(200).send({ status: true, data: updatedOrder });
  }
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, cancellable: true },
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!updatedOrder) {
    return next(new ErrorHandler(400, "This order can not be cancelled"));
  }
  return res.status(200).send({ status: true, data: updatedOrder });
};
