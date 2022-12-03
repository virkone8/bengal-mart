const express = require('express');



const userController = require('../controllers/user');
const { userLog } = require('../middleware/auth');
const authCheck = require('../middleware/auth').userLog;
const { body, check } = require("express-validator");

const router = express.Router();

router.get('/',userController.getIndex);

router.get('/products', userController.getProducts);

router.get('/products/:productId', userController.getProduct);

router.get('/login',userController.getLogin);

router.post('/login',userController.postLogin);

router.get('/signup',userController.getSignup);

router.post('/signup', [
    check("email").isEmail().withMessage("input valid email"),
    body("password", "wrong password").matches(
      "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[&*!#@]).{4,15}$"
    ),
  ],userController.postSignup);

router.get('/logout',userController.getLogout);

router.get("/forgotPassword", userController.getForgetPassword);

router.post("/forgetPassword", userController.postForgetPassword);

router.get("/changePassword/:email/:uid", userController.getChangePassword);

router.post(
  "/changePassword",
  [
    body("password", "wrong password").matches(
      "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[&*!#@]).{4,15}$"
    ),
  ],
  userController.postChangePassword
);
router.get(
  "/confirmation/:email/:jwtoken",
  userController.getConfirmation
);


router.get('/cart',authCheck, userController.getCart);

router.post('/cart',authCheck, userController.postCart);

router.post('/cart-delete-item',authCheck, userController.postCartDeleteProduct);

router.post('/create-order',authCheck, userController.postOrder);

router.get('/orders',authCheck, userController.getOrders);





module.exports=router;