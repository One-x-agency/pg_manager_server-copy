const express = require('express');
const AnalyticsController = require('./analytics.controller');
const { validate } = require('../../../utility/validationHelper');
const AnalyticsValidation = require('./analytics.validation');
const { hasAccessToPg } = require('../../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(validate(AnalyticsValidation.analytics), hasAccessToPg, AnalyticsController.analytics);

module.exports = router;
