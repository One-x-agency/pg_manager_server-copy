const express = require('express');
const { validate } = require('../../utility/validationHelper');
const InquiryValidation = require('./inquiry.validation');
const InquiryController = require('./inquiry.controller');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('inquiry.create'),
    validate(InquiryValidation.create),
    InquiryController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('inquiry.read'),
    InquiryController.list,
  );

router.route('/:inquiryId')
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('inquiry.update'),
    validate(InquiryValidation.update),
    InquiryController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('inquiry.delete'),
    validate(InquiryValidation.delete),
    InquiryController.delete,
  );

module.exports = router;
