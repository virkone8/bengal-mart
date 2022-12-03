exports.adminLog = (req, res, next) => {
  if (!req.session.isAdminLoggedIn) {
    console.log('Login first to see');
    res.redirect('/admin/login');
  }
  next();
};

exports.userLog = (req, res, next) => {
  if (!req.session.isUserLoggedIn) {
    console.log('Login first to see');
    res.redirect('/login');
  }
  next();
};
