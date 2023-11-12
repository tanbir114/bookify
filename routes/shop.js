const express = require('express');
const shopController = require('../controllers/shop');
// const productService = require('../models/productService');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/shops', shopController.getIndex);
router.get('/shops/:shopId', shopController.getShop);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/products/:productCategory', shopController.getProductCategory);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/orders', isAuth, shopController.getOrders);
// router.get('/checkout', shopController.getCheckout);
router.post('/create-order', isAuth, shopController.postOrder);
router.get('/search',isAuth,shopController.getSearch);



module.exports = router;
