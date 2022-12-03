const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const multer = require("multer");


const errorController = require('./controllers/error');
const Admin = require('./models/admin');
const User = require('./models/user');

const app = express();

// Step1 for session
const session = require('express-session');
const mongodb_session = require('connect-mongodb-session')(session);

//Step2 session
const session_store_admin = new mongodb_session({
  uri: 'mongodb+srv://virat:1234056789@cluster0.hpkepgp.mongodb.net/Bengal',
  collection: 'admin-session',
});

const session_store_user = new mongodb_session({
  uri: 'mongodb+srv://virat:1234056789@cluster0.hpkepgp.mongodb.net/Bengal',
  collection: 'user-session',
});

app.use(cookieParser());

// Step 3 session
//session is function here. to stop resaving, resave value false to stop storing uninitialized value, saveUninitialize:false
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: session_store_admin,
  })
);

app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: session_store_user,
  })
);

// Multer
app.use(
  "/uploadedImage",
  express.static(path.join(__dirname, "uploadedImage")) // to store images
);

//to use the images folder after adding it to database
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploadedImage");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg") ||
    file.mimetype.includes("jpeg")
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: { fieldSize: 1024 * 1024 * 5 },
  }).fields([
    { name: "productImage", maxCount: 1 },
    { name: "userImage", maxCount: 1 },
  ])
);

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use((req, res, next) => {
  if (!req.session.admin) {
    return next();
  }
  Admin.findById(req.session.admin._id)
    .then((adminValue) => {
      req.admin = adminValue;
      // console.log('User details:',req.user);
      next();
    })
    .catch((err) => {
      console.log('User not found', err);
    });
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((userValue) => {
      req.user = userValue;
      // console.log('User details:',req.user);
      next();
    })
    .catch((err) => {
      console.log('User not found', err);
    });
});

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAdminAuthenticated = req.session.isAdminLoggedIn;
  res.locals.adminData = req.session.admin;
  next();
});
app.use((req, res, next) => {
  res.locals.isUserAuthenticated = req.session.isUserLoggedIn;
  res.locals.userData = req.session.user;
  next();
});

// app.use((req, res, next) => {
//   User.findById('5bab316ce0a7c75f783cb8a8')
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(userRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    'mongodb+srv://virat:1234056789@cluster0.hpkepgp.mongodb.net/Bengal?retryWrites=true'
  )
  .then((result) => {
    Admin.findOne().then((admin) => {
      if (!admin) {
        const admin = new Admin({
          email: 'virat@test.com',
          password: '123456789',
        });
        admin.save();
      }
    });
    app.listen(3000, () => {
      console.log('Server Connected');
    });
  })
  .catch((err) => {
    console.log(err);
  });
