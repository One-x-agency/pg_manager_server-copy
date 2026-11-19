const express = require('express');
const ExpenseValidation = require('./expense.validation');
const ExpenseController = require('./expense.controller');
const { validate } = require('../../utility/validationHelper');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('expense.update'),
    validate(ExpenseValidation.create),
    ExpenseController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('expense.read'),
    ExpenseController.list,
  );

router.route('/export-data').get(
  privateRoute,
  hasAccessToPg,
  hasPermission('expense.read'),
  validate(ExpenseValidation.exportData),
  ExpenseController.exportData,

);

router.route('/:expenseId')
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('expense.update'),
    validate(ExpenseValidation.update),
    ExpenseController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('expense.update'),
    validate(ExpenseValidation.delete),
    ExpenseController.delete,
  );

module.exports = router;
