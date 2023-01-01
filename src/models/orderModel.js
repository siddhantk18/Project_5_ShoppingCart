const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: [true, "Please provide the user ID"],
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
    },
    totalItems: {
      type: Number,
      required: [true, "Please mention total items"],
    },
    cancellable: { type: Boolean, default: true },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "completed", "cancled"],
        message: `Status can only be "pending", "completed" or "cancled"`,
      },
    },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
