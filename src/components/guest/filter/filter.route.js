const express = require('express');
const MonthlyPaymentViewController = require('./filter.controller');
const { validate } = require('../../../utility/validationHelper');
const MonthlyPaymentViewValidation = require('./filter.validation');
const { privateRoute } = require('../../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/pending-monthly-payment')
  .get(privateRoute, validate(MonthlyPaymentViewValidation.getViewData), MonthlyPaymentViewController.getViewData);

module.exports = router;
