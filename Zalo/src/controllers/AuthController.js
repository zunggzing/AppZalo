const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
// const userService = require('../services/userService');
const http = require('./http');
const axios = require('axios');

class LoginController {
  showLogin(req, res) {
    res.locals.message = req.flash('errors');
    res.render('login');
  }

  getLogout(req, res) {
    req.logout();
    req.flash('success', 'Đăng xuất thành công');
    return res.redirect('/login-register');
  }

  checkLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login-register');
    }
    next();
  }

  checkRole(req, res, next) {
    if (req.isAuthenticated() && req.user.data.user.role == 'user') {
      return res.redirect('/home');
    }
    if (req.isAuthenticated() && req.user.data.user.role == 'admin') {
      return res.redirect('/admin');
    }
    next();
  }

  showRegister(req, res) {
    res.render('register');
  }
  showResetPassword(req, res) {
    res.render('resetpassword');
  }
  showUpdatePassword(req, res) {
    let phone = req.query.phone;
    let phoneRegister = phone.slice(phone.length - 9);
    res.render('updatepassword', {
      phone: '0' + phoneRegister,
    });
  }
  async createInDatabase(req, res) {
    if (req.body.password == req.body.passwordConfirm) {
      const passHash = await bcrypt.hash(req.body.password, 10);

      let user = await axios.post(http + '/users', {
        userName: req.body.userName,
        local: {
          phone: req.body.phone,
          password: passHash,
        },
      });
      console.log(user);
      console.log('Thanh cong dang kys');
      req.flash('success', 'Tài khoản đăng ký thành công!');
      res.redirect('/login-register');
    }
  }
  async showResetNewPassword(req, res) {
    let phone = req.query.phone;
    let phoneReset = phone.slice(phone.length - 9);
    res.render('./updatenewpassword', {
      phone: '0' + phoneReset,
    });
  }
  async updateResetNewPassword(req, res) {
    try {
      let phoneReset = req.body.phoneReset;
      let userPhone = await axios.get(
        http + '/users/searchPhone/' + phoneReset
      );
      const { user } = userPhone.data;
      let userPhoneReset = await axios.get(http + `/users/` + user._id);
      const passResetHash = await bcrypt.hash(req.body.passwordInforReset, 10);
      userPhoneReset.data.user.local.password = passResetHash;
      let putPassword = await axios.put(
        http + `/users/` + user._id,
        userPhoneReset.data.user
      );
      req.flash('success', 'Đổi mật khẩu thành công');
      res.redirect('/login-register');
    } catch (err) {
      console.log(err);
      console.log('ERROR');
    }
  }
}

module.exports = new LoginController();
