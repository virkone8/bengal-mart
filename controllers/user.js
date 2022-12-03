const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Token = require('../models/token');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcryptjs=require('bcryptjs');


const transporter = nodemailer.createTransport({
  host: 'smtp',
  port: 1200,
  secure: false,
  requireTLS: true,
  service: 'gmail',
  auth: {
    user: '',
    pass: '',
  },
});

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      if(res.locals.isUserAuthenticated){
        req.user
          .populate('cart.items.productId')
        .then((user) => {
           res.locals.cartNumber = user.cart.items.length;
           console.log(res.locals.cartNumber)
        }).catch(err=>{
          console.log(err);
        });
      }
      res.render('common/home', {
        prods: products,
        titlePage: 'Bengal Mart',
        path: '/',

      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if(res.locals.isUserAuthenticated){
        req.user
          .populate('cart.items.productId')
        .then((user) => {
           res.locals.cartNumber = user.cart.items.length;
        }).catch(err=>{
          console.log(err);
        });
      }
      res.render('common/product-detail', {
        product: product,
        titlePage: product.title,
        path: '/products',
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      if(res.locals.isUserAuthenticated){
        req.user
          .populate('cart.items.productId')
        .then((user) => {
           res.locals.cartNumber = user.cart.items.length;

           
        }).catch(err=>{
          console.log(err);
        });
      }
      res.render('common/product-list', {
        prods: products,
        titlePage: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log('Cookie' + req.cookies);
  res.render('user/login', {
    titlePage: 'Login',
    // searched: null,
    errorMsg: message,
    error: [],
    path: '/login',
    cookie_data: req.cookies,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let checked = req.body.checked;

  User.findOne({ email: email })
    .then((userValue) => {
      if (!userValue) {
        console.log("Invalid Email");
        req.flash("error", "Error:: Invalid Email");
        res.redirect("/login");
      }
      bcryptjs
        .compare(password, userValue.password)
        .then((result) => {
          if (!result) {
            console.log("Invalid Password");
            req.flash("error", "Error:: Invalid Password");
            return res.redirect("/login");
          } else {
            console.log("Valid Password " + result);
            req.session.isUserLoggedIn = true;
            //isLoggedIn is a user defined variable in the session to check user is logged in or not
            req.session.user = userValue;
            //user is a variable in session to store logged in user value
            return req.session.save((err) => {
              if (err) {
                console.log("Session saving error:", err);
              } else {
                if (checked) {
                  const cookie_value = {
                    emailCookie: userValue.email,
                    passwordCookie: password,
                  };
                  res.cookie("cookieData", cookie_value, {
                    expires: new Date(Date.now() + 12000000),
                    httpOnly: true,
                  });
                }
                console.log("logged in ");
                return res.redirect("/products");
              }
            });
          }
        })
        .catch((err) => {
          console.log("Error to Compare", err);
          return res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log("Error to find Email", err);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('user/signup', {
    titlePage: 'Sign Up',
    // searched: null,
    errorMsg: message,
    error: [],
    path: '/signup',
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  let error = validationResult(req);

  if (!error.isEmpty()) {
    errorResponse = error.array();
    // console.log("Error response: ", errorResponse);
    res.render('user/authModal', {
      titlePage: 'Sign Up',
      // searched: null,
      errorMsg: '',
      error: errorResponse,
      path: '/signup',
    });
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          console.log('User already exist');
          req.flash('error', 'Error:: User already exist');
          return res.redirect('/signup');
        }

        bcryptjs
          .hash(password, 12)
          .then((hashedPassword) => {
            let user = new User({
              name: name,
              email: email,
              password: hashedPassword,
            });

            user
              .save()
              .then((result) => {
                console.log('User is saved,registration done');

                const token_jwt = jwt.sign({ email: result.email }, 'vyvuyvuvuchvuuxesykyucifuvucvytyxycyf7f;giogydrxrxucyfiufuvucvyucl,', {
                  expiresIn: '1h',
                });
                const token = new Token({
                  _userId: result._id,
                  token: token_jwt,
                });

                token.save()
                  .then((resu) => {
                    let mailOptions = {
                      from: '',
                      to: result.email,
                      subject: 'Welcome in our site',
                      text: `Hello ${result.name},
                            To verify your account click below link
                            http://${req.header('host')}/confirmation/${result.email}/${token_jwt}
                            Thank You!`,
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log('Error to send mail:', error);
                        req.flash('error', 'Error to send mail');
                        res.redirect('/signup');
                      } else {
                        console.log('Email sent: ', info.response);
                        req.flash('error', 'Email Sent');
                        res.redirect('/');
                      }
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                console.log('Error at saving data', err);
                return res.redirect('/signup');
              });
          })
          .catch((err) => {
            console.log('Error while bcrypting password', err);
            res.redirect('/signup');
          });
      })
      .catch((err) => {
        console.log('Error while findone user', err);
      });
  }
};

exports.getForgetPassword = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("user/forgot-password", {
    titlePage: "Forgot Password Page",
    // searched: null,
    errorMsg: message,
    error: [],
    path: "/forgotPassword",
  });
};

exports.postForgetPassword = (req, res) => {
  let email = req.body.email;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      console.log("Invalid Email");
      req.flash("error", "Error:: Invalid Email");
      res.redirect("/forgotPassword");
    }

    let mailOptions = {
      from: "",
      to: user.email,
      subject: "Change Password",
      text: `Hello ${user.name}, 
      To set new password click below link
      http://${req.header("host")}/changePassword/${user.email}/${user._id}
      Thank You!`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error to send mail:", error);
        req.flash("error", "Error to send mail");
        res.redirect("/forgotPassword");
      } else {
        // console.log(req.header("host"));
        console.log("Email sent: ", info.response);
        req.flash("error", "Email Sent");
        res.redirect("/forgotPassword");
      }
    });
  });
};

exports.getChangePassword = (req, res) => {
  let email = req.params.email;
  let uid = req.params.uid;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("user/changepassword", {
    titlePage: "Change Password Page",
    // searched: null,
    errorMsg: message,
    error: [],
    path: "/changePassword/:email/:uid",
    email: email,
    uid: uid,
  });
};

exports.postChangePassword = (req, res) => {
  let uid = req.body.uid;
  let email = req.body.email;
  let password = req.body.password;
  let cpassword = req.body.cpassword;
  let error = validationResult(req);
  if (!error.isEmpty()) {
    errorResponse = error.array();
    // console.log("Error response: ", errorResponse);
    res.render("Auth/changepass", {
      titlePage: "Change Password Page",
      // searched: null,
      errorMsg: "",
      error: errorResponse,
      path: "/changePassword/:email/:uid",
      email: email,
      uid: uid,
    });
  } else {
    if (!(password === cpassword)) {
      console.log("Confirm password must be same with password");
      req.flash(
        "error",
        "Error:: Confirm password must be matched with password"
      );
      res.redirect(`/changePassword/${result.email}/${uid}`);
    }

    bcryptjs.hash(cpassword, 12).then((password) => {
      User.findById(uid).then((user) => {
        user.password = password;
        user
          .save()
          .then((result) => {
            let mailOptions = {
              from: "",
              to: result.email,
              subject: "Password Changed",
              text:
                "Hello " +
                result.name +
                "\n\n" +
                `You have successfully changed your password
                Please Sign in now
              http://${req.header("host")}/login`,
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log("Error to send mail:", error);
                // req.flash("error", "Error to send mail");
                res.redirect("/login");
              } else {
                console.log("Email sent: ", info.response);
                req.flash(
                  "error",
                  `You have successfully changed your password
                Please Sign in now
              http://${req.header("host")}/login`
                );
                console.log(`/changePassword/${email}/${uid}`);
                res.redirect(`/changePassword/${result.email}/${uid}`);
              }
            });
          })
          .catch((err) => {
            console.log("Error at saving data", err);
          });
      });
    });
  }
};


exports.getConfirmation = (req, res) => {
  const token = req.params.jwtoken;
  const email = req.params.email;

  TokenModel.find({ token: token })
    .then((result) => {
      User.find({ email: email, _id: result[0]._userId })
        .then((data) => {
          console.log(data);
          data[0].isVerified = true;
          data[0]
            .save()
            .then((info) => {
              console.log("Verified Successful");
            })
            .catch((err) => {
              console.log("Error while verification");
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};


exports.getCart = (req, res, next) => {
  
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      res.locals.cartNumber=user.cart.items.length;
      console.log('Hello',res.locals.cartNumber);
      const products = user.cart.items;
      // console.log(products);
      res.render('user/cart', {
        path: '/cart',
        titlePage: 'Your Cart',
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      if(res.locals.isUserAuthenticated){
        req.user
    .populate('cart.items.productId')
    .then((user) => {
      res.locals.cartNumber=user.cart.items.length;
         console.log(res.locals.cartNumber);
        }).catch(err=>{
          console.log(err);
        });
      }
      res.render('user/orders', {
        path: '/orders',
        titlePage: 'Your Orders',
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.getLogout = (req, res) => {
  res.locals.cartNumber='';
  req.session.destroy();
  res.redirect("/login");
};