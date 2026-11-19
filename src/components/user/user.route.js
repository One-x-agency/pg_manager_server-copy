const express = require('express');
const UserValidation = require('./user.validation');
const UserController = require('./user.controller');
const { validate } = require('../../utility/validationHelper');
const { privateRoute, isRootLoggedIn } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
  .get(privateRoute, validate(UserValidation.list), UserController.list)
  .post(privateRoute, isRootLoggedIn, validate(UserValidation.create), UserController.create);

router.route('/login/:accountNumber')
  .post(validate(UserValidation.login), UserController.login);

router.route('/permission')
  .get(privateRoute, validate(UserValidation.fetchUserPermissionsForPg), UserController.fetchUserPermissionsForPg);

router.route('/:userId')
  .get(privateRoute, isRootLoggedIn, validate(UserValidation.getUserById), UserController.getUserById)
  .put(privateRoute, isRootLoggedIn, validate(UserValidation.update), UserController.update)
  .delete(privateRoute, isRootLoggedIn, validate(UserValidation.delete), UserController.delete);

router.route('/:userId/permission')
  .post(privateRoute, isRootLoggedIn, validate(UserValidation.updateUserPermission), UserController.updateUserPermission)
  .delete(privateRoute, isRootLoggedIn, validate(UserValidation.deletePermission), UserController.deletePermission);

module.exports = router;
