const express = require('express');
const StateController = require('./state.controller');
const StateValidation = require('./state.validation');
const { validate } = require('../../utility/validationHelper');

const router = express.Router();

router.route('/')
  .get(validate(StateValidation.list), StateController.list);

module.exports = router;
