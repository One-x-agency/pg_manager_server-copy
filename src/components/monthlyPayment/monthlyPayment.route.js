const express = require('express');
const MonthlyPaymentController = require('./monthlyPayment.controller');
const MonthlyPaymentValidation = require('./monthlyPayment.validation');
const { validate } = require('../../utility/validationHelper');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(MonthlyPaymentValidation.create),
    MonthlyPaymentController.createOrUpsert,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.read'),
    validate(MonthlyPaymentValidation.list),
    MonthlyPaymentController.list,
  );

router.route('/export-data').get(
  privateRoute,
  hasAccessToPg,
  hasPermission('guest.read'),
  validate(MonthlyPaymentValidation.exportData),
  MonthlyPaymentController.exportData,
);

router.route('/:monthlyPaymentId')
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(MonthlyPaymentValidation.update),
    MonthlyPaymentController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(MonthlyPaymentValidation.delete),
    MonthlyPaymentController.delete,
  );

module.exports = router;
