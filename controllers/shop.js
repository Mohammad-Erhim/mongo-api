const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");
const User = require("../models/user");
const ITEMS_PER_PAGE = 6;
exports.products = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res
        .status(200)
        .json({
          products,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.product = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.status(200).json({ product });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getCart = (req, res, next) => {
  User.findById(req.user._id)
    .populate("cart.productId")

    .then((user) => {
      const products = user.cart;
      res.status(200).json({ products });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addProductToCart = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      if (product) return req.user.addToCart(product);
    })
    .then((result) => {
      res.status(201).json({ message: "product added to cart." });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteProductFromCart = (req, res, next) => {
  const prodId = req.params.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.status(200).json({ message: "product deleted from cart." });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addOrder = (req, res, next) => {
  req.user
    .populate("cart.productId")

    .then((user) => {
      if (user.cart.length === 0) {
        const err = new Error("Cart is empty");
        throw err;
      }
      const products = user.cart.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        userId: req.user,
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.status(200).json({ message: "Order added" });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.user._id })
    .then((orders) => {
      res.status(200).json({ orders });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";

    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );

    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });
    pdfDoc.text("-----------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          prod.product.title +
            " - " +
            prod.quantity +
            " x " +
            "$" +
            prod.product.price
        );
    });
    pdfDoc.text("---");
    pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

    pdfDoc.end();
  } catch (error) {
    next(err);
  }
};

exports.deleteOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        next(err);
      }

      return Order.deleteOne({ _id: orderId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ message: "order deleted." });
    })
    .catch((err) => {
      next(err);
    });
};
