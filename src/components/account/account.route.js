const express = require('express');
const Controller = require('./account.controller');
const Validation = require('./account.validation');
const { validate } = require('../../utility/validationHelper');
const { isRootLoggedIn, privateRoute } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
  .post(validate(Validation.register), Controller.register)
  .delete(privateRoute, isRootLoggedIn, validate(Validation.deleteAccount), Controller.deleteAccount);

router.route('/verify-email')
  .post(validate(Validation.verifyEmail), Controller.verifyEmail);

router.route('/login-with-google')
  .post(validate(Validation.loginWithGoogle), Controller.loginWithGoogle);

router.route('/complete-registration')
  .post(validate(Validation.completeAccountRegistration), Controller.completeAccountRegistration);

router.route('/login')
  .post(validate(Validation.login), Controller.login);

router.route('/logout')
  .delete(Controller.logout);

router.route('/change-password')
  .post(privateRoute, isRootLoggedIn, validate(Validation.changePassword), Controller.changePassword);

router.route('/forgot-password')
  .post(validate(Validation.forgotPassword), Controller.forgotPassword);

router.route('/reset-password')
  .post(validate(Validation.resetPassword), Controller.resetPassword);

router.route('/:accountId')
  .get(privateRoute, isRootLoggedIn, Controller.getAccount);

module.exports = router;
