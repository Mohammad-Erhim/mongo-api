const express = require('express');

const shopController = require('../controllers/shop');
 
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.get('/products', shopController.products);

router.get('/products/:productId', shopController.product);

router.get('/cart',isAuth, shopController.getCart);
router.put('/cart/:productId',isAuth, shopController.addProductToCart);

router.delete('/cart/:productId',isAuth, shopController.deleteProductFromCart);

router.post('/orders', isAuth, shopController.addOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);
router.delete('/orders/:orderId',isAuth, shopController.deleteOrder);

module.exports = router;