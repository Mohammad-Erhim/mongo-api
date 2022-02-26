const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { upload } = require("../util/upload");

const router = express.Router();

 
router.get("/products", isAuth, adminController.products);

router.post(
  "/products",upload.single('image'),
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.addProduct
);

 

router.patch(
  "/products/:productId",upload.single('image'),
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.updateProduct
);

router.delete("/products/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
