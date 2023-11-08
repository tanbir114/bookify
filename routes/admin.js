const path = require('path');
const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.get('/products', isAuth,adminController.getProducts);

router.get('/add-product', isAuth,adminController.getAddProduct);
router.post('/add-product', isAuth,adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth,adminController.getEditProduct);
router.post('/edit-product', isAuth,adminController.postEditProduct);

router.post('/delete-product', isAuth,adminController.postDeleteProduct);

router.get('/create-shop', isAuth,adminController.getCreateShop);
router.post('/create-shop', isAuth,adminController.postCreateShop);

router.get('/sales', isAuth,adminController.getSales);

module.exports = router;
