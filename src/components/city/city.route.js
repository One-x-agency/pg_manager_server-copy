const express = require('express');
const CityController = require('./city.controller');
const CityValidation = require('./city.validation');
const { validate } = require('../../utility/validationHelper');

const router = express.Router();

router.route('/')
  .get(validate(CityValidation.list), CityController.list);

module.exports = router;
