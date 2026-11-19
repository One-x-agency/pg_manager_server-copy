const express = require('express');
const PgController = require('./pg.controller');
const PgValidation = require('./pg.validation');
const { validate } = require('../../utility/validationHelper');
const { isRootLoggedIn, hasAccessToPg, privateRoute } = require('../../middleware/auth');
const AnalyticsRoute = require('./analytics/analytics.route');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(privateRoute, isRootLoggedIn, validate(PgValidation.create), PgController.create)
  .get(privateRoute, PgController.list);

router.route('/verify-code/:code')
  .get(privateRoute, isRootLoggedIn, validate(PgValidation.codeValidationSchema), PgController.verifyCode);

router.route('/:pgId')
  .get(privateRoute, hasAccessToPg, validate(PgValidation.getOne), PgController.findByPgId)
  .put(privateRoute, hasAccessToPg, validate(PgValidation.updatePg), PgController.update)
  .delete(privateRoute, isRootLoggedIn, hasAccessToPg, validate(PgValidation.delete), PgController.delete);

router.use('/:pgId/analytics', privateRoute, AnalyticsRoute);

module.exports = router;
