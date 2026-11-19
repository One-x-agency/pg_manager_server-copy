const express = require('express');
const ReminderController = require('./reminder.controller');

const { validate } = require('../../utility/validationHelper');
const ReminderValidation = require('./reminder.validation');
const { privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(
    privateRoute,
    hasAccessToPg,
    ReminderController.list,
  );

router.route('/upsert')
  .post(
    privateRoute,
    hasAccessToPg,
    validate(ReminderValidation.upsert),
    ReminderController.upsert,
  );

module.exports = router;
