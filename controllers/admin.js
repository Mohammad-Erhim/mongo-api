const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../util/file");
const ObjectID = require("mongodb").ObjectId;

exports.products = (req, res, next) => {
  Product.find({ userId: req.user._id })

    .then((products) => {
      res.status(200).json({ products });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  try {
    if (!image) {
      const error = new Error("attached file is not an image.");
      error.statusCode = 400;
      throw error;
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("invalid data.");
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    const imageUrl = image.path;

    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user._id,
    });
    await product.save();
    return res.status(201).json({ message: "product added.", product });
  } catch (err) {
    
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  try {
    console.log({ _id: prodId, userId: req.user._id });
    const product = await Product.findOne({
      _id: prodId,
      userId: req.user._id,
    });
    if (!errors.isEmpty()) {
      const error = new Error("invalid data.");
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    console.log(product);
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    return res.status(200).json({ message: "product updated.", product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findOneAndDelete({
      _id: prodId,
      userId: req.user._id,
    });
    console.log(product);
    if (!product) {
      const error = new Error("product is not exist");
      error.statusCode = 404;

      throw error;
    }

    fileHelper.deleteFile(product.imageUrl);

    return res.status(200).json({ message: "product deleted." });
  } catch (err) {
    next(err);
  }
};
