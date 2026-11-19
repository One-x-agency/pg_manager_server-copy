const express = require('express');
const CountryController = require('./country.controller');

const router = express.Router();

router.route('/')
  .get(CountryController.list);

module.exports = router;
