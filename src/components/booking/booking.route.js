const express = require('express');
const BookingValidation = require('./booking.validation');
const BookingController = require('./booking.controller');
const { validate } = require('../../utility/validationHelper');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('booking.update'),
    validate(BookingValidation.create),
    BookingController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('booking.read'),
    BookingController.list,
  );

router.route('/:bookingId')
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('booking.update'),
    validate(BookingValidation.update),
    BookingController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('booking.update'),
    validate(BookingValidation.delete),
    BookingController.delete,
  );

module.exports = router;
