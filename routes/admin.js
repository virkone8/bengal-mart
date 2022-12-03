const express = require('express');

const adminController = require('../controllers/admin');
const authCheck = require('../middleware/auth').adminLog;

const router = express.Router();

router.get('/login', adminController.getLogin);

router.post('/login', adminController.postLogin);

router.get('/adminDashBoard', authCheck, adminController.getDashBoard);

router.get('/add-product', authCheck, adminController.getAddProduct);

router.post('/add-product', authCheck, adminController.postAddProduct);

router.get('/products',authCheck,adminController.getProducts)

router.get('/orders',authCheck,adminController.getOrders)

router.get('/edit-product/:productId',authCheck, adminController.getEditProduct);

router.post('/edit-product',authCheck, adminController.postEditProduct);

router.post('/delete-product',authCheck, adminController.postDeleteProduct);

router.get('/logout',authCheck, adminController.getLogout);

module.exports = router;
