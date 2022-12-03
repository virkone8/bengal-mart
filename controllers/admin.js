const Admin = require('../models/admin');
const Product = require('../models/product');
const Order = require('../models/order');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(req.cookies);
  res.render('admin/login', {
    titlePage: 'Admin Login',
    errorMsg: message,
    cookie_data: req.cookies,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const checked = req.body.checked;

  Admin.find({ email: email, password: password })
    .then((admin) => {
      if (!admin[0]) {
        console.log('Invalid Email Or Password');
        req.flash('error', 'Error:: Invalid Email or Password');
        return res.redirect('/admin/login');
      }
      req.session.isAdminLoggedIn = true;
      req.session.admin = admin[0];

      return req.session.save((err) => {
        if (err) {
          console.log('Session saving error:', err);
        } else {
          if (checked) {
            const cookie_value = {
              emailCookie: admin[0].email,
              passwordCookie: password,
            };
            res.cookie('cookieData', cookie_value, {
              expires: new Date(Date.now() + 12000000),
              httpOnly: true,
            });
          }
                Order.find()
            .then((orders) => {
          res.locals.uorders=orders;
          });
          console.log('logged in ');
          return res.redirect('/admin/adminDashBoard');
        }
      });
    })
    .catch((err) => {
      console.log('Error while LogIn');
    });
};

exports.getDashBoard = (req, res, next) => {
  res.render('admin/index', {
    titlePage: 'Admin Dashboard',
    path:'/admin/adminDashBoard'

  });
};

exports.getOrders=(req,res,next)=>{
   res.render('admin/index', {
    titlePage: 'Order Details',
    path:'/admin/orders'
  });
}

exports.getAddProduct =(req,res,next)=>{
  res.render('admin/edit-product',{
    titlePage:'Add Product',
    path:'/admin/add-product',
    editing:false
  })
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image=req.files["productImage"][0]
  const imageUrl = image.path;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        titlePage: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/admin/products');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/admin/products');
      }
      res.render('admin/edit-product', {
        titlePage: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const oldProductImageUrl=req.body.product_Image;
  let updatedImageUrl;
  if(req.files.length>0){
  const image=req.files["productImage"][0];
  updatedImageUrl = image.path;
  }else{
   updatedImageUrl = oldProductImageUrl;
  }


  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getLogout=(req,res,next)=>{
   req.session.destroy();
  res.redirect("/admin/login");
}
