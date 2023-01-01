const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../errorHandler/errorHandlingClass");

exports.addToCart = async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.body.productId,
    isDeleted: false,
  });
  if (!product) {
    return next(
      new ErrorHandler(404, "Either the product does not exist or is deleted")
    );
  }
  const cart = await Cart.findOne({
    userId: req.params.userId,
  });
  if (!cart) {
    const items = [];
    items.push({ productId: req.body.productId, quantity: 1 });
    req.body.items = items;
    req.body.userId = req.params.userId;
    req.body.totalPrice = product.price;
    req.body.totalItems = 1;
    const newCart = await Cart.create(req.body);
    return res.status(201).send({ status: true, data: newCart });
  }
  const carts = JSON.parse(JSON.stringify(cart));
  // eslint-disable-next-line array-callback-return
  const result = carts.items.map((el) => {
    if (el.productId === req.body.productId) {
      el.quantity += 1;
      return el.quantity;
    }
  });
  const hasNumber = /\d/;
  if (hasNumber.test(result)) {
    carts.totalPrice += product.price;
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $set: carts,
      },
      { new: true }
    );
    return res.status(200).send({ status: true, data: updatedCart });
  }

  carts.items.push({ productId: req.body.productId, quantity: 1 });
  carts.totalPrice += product.price;
  carts.totalItems += 1;
  const updatedCart = await Cart.findOneAndUpdate(
    { userId: req.params.userId },
    {
      $set: carts,
    },
    { new: true }
  );
  return res.status(200).send({ status: true, data: updatedCart });
};

exports.updateCart = async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) {
    return next(new ErrorHandler(404, "No cart exist for this user"));
  }
  const product = await Product.findOne({
    _id: req.body.productId,
    isDeleted: false,
  });
  const carts = JSON.parse(JSON.stringify(cart));
  if (req.body.removeProduct === "0") {
    carts.items.forEach((el) => {
      if (el.productId === req.body.productId) {
        carts.items.splice(carts.items.indexOf(el), 1);
        carts.totalItems -= 1;
        carts.totalPrice -= product.price * el.quantity;
      }
    });
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: carts },
      { new: true }
    );
    return res.status(200).send({ status: true, data: updatedCart });
  }
  if (req.body.removeProduct === "1") {
    carts.items.forEach((el) => {
      if (el.productId === req.body.productId) {
        if (el.quantity > 1) {
          carts.totalPrice -= product.price;
          el.quantity -= 1;
        } else {
          carts.totalPrice -= product.price;
          carts.items.splice(carts.items.indexOf(el), 1);
          carts.totalItems -= 1;
        }
      }
    });
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: carts },
      { new: true }
    );
    return res.status(200).send({ status: true, data: updatedCart });
  }
};
exports.getCartSummary = async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate(
    "items.productId"
  );
  if (!cart) {
    return next(new ErrorHandler(404, "No cart exist for this user"));
  }
  return res.status(200).send({ status: true, data: cart });
};

exports.deleteCart = async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) {
    return next(new ErrorHandler(404, "No cart exist for this user"));
  }
  const carts = JSON.parse(JSON.stringify(cart));
  carts.items.length = 0;
  carts.totalPrice = 0;
  carts.totalItems = 0;
  const deletedCart = await Cart.findOneAndUpdate(
    { userId: req.params.userId },
    { $set: carts },
    { new: true }
  );
  return res.status(204).send({ status: true, data: deletedCart });
};
