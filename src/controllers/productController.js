const Product = require("../models/productModel");
const aws = require("../aws/aws");
const ErrorHandler = require("../errorHandler/errorHandlingClass");
const QueryFilter = require("../utils/QueryFilter");

exports.createProduct = async (req, res, next) => {
  const { files } = req;
  const { availableSizes } = req.body;
  if (!(files && files.length)) {
    return next(new ErrorHandler(400, "Please upload image of the product"));
  }
  req.body.productImage = await aws.uploadFile(files[0]);
  if (availableSizes) {
    const sizesAvailable = availableSizes.split(",").map((el) => el.trim());
    req.body.availableSizes = sizesAvailable;
  }
  const newProduct = await Product.create(req.body);
  return res
    .status(201)
    .send({ status: true, message: "Success", data: newProduct });
};

exports.getProducts = async (req, res, next) => {
  if (req.params.productId) {
    const product = await Product.findOne({
      _id: req.params.productId,
      isDeleted: false,
    });
    if (!product) {
      return next(new ErrorHandler(404, "No products exists with this ID"));
    }
    return res.status(200).send({ status: true, data: product });
  }

  if (Object.keys(req.query).length === 0) {
    const products = await Product.find({ isDeleted: false });
    return res.status(200).send({ status: true, data: products });
  }
  req.query.isDeleted = false;
  const queryProducts = new QueryFilter(Product.find(), req.query)
    .filter()
    .sort();
  const products = await queryProducts.query;
  if (products.length === 0) {
    return next(new ErrorHandler(404, "No products matched this filter"));
  }
  res.status(200).send({ status: true, data: products });
};

exports.updateProduct = async (req, res, next) => {
  const { availableSizes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return next(new ErrorHandler(400, "Please do not leave field empty"));
  }
  if (availableSizes) {
    const sizesAvailable = availableSizes.split(",").map((el) => el.trim());
    req.body.availableSizes = sizesAvailable;
  }
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: req.params.productId, isDeleted: false },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!updatedProduct) {
    return next(new ErrorHandler(404, "No product matched this query"));
  }
  return res.status(200).send({ status: true, data: updatedProduct });
};

exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, isDeleted: false },
    {
      $set: { isDeleted: true, deletedAt: Date.now() },
    }
  );
  if (!product) {
    return next(new ErrorHandler(400, "No product matched with the query"));
  }
  return res
    .status(200)
    .send({ status: true, message: "Product deleted successfully" });
};
