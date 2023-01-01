const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: [true, "Please provide the user ID"],
      unique: true,
    },
    items: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          required: [true, "Please provide product ID"],
        },
        quantity: {
          type: Number,
          required: [true, "Please mention the quantity"],
          min: [1, "Minimum quantity should be 1"],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Please mention the total price"],
      comment: "Holds total price of all the items in the cart",
    },
    totalItems: {
      type: Number,
      required: [true, "Please mention total items"],
      comment: "Holds total number of items in the cart",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
