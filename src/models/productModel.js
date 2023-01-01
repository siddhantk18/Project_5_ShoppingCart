/* eslint-disable new-cap */
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please Provide product name"],
      unique: true,
    },

    description: {
      type: String,
      required: [true, "Please Provide product description"],
    },

    price: {
      type: Number,
      required: [true, "Please Provide product price"],
    },

    currencyId: {
      type: String,
      required: [true, "Please Provide product currency Id"],
    },

    currencyFormat: {
      type: String,
      required: [true, "Please provide currencyFormat"],
    },

    isFreeShipping: {
      type: Boolean,
      default: false,
    },

    productImage: {
      type: String,
      required: [true, "Please Provide product Image"],
    },

    style: { type: String },

    availableSizes: {
      type: [String],
      enum: {
        values: ["S", "XS", "M", "X", "L", "XXL", "XL"],
        message: "Sizes can only be S, XS, M, XL, L, XXL",
      },
      required: [true, "Please mention the sizes available for your product"],
    },

    installments: { type: Number },

    deletedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  const currencyFormat = "₹";
  const currencyId = "INR";
  this.currencyFormat = currencyFormat;
  this.currencyId = currencyId;
  next();
});

module.exports = new mongoose.model("product", productSchema);
