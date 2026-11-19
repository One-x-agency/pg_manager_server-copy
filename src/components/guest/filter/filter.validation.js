const Joi = require('joi');
const ValidationSchema = require('../../../config/validationSchema');

module.exports = {
  getViewData: {
    query: Joi.object().keys({
      month: ValidationSchema.month.default(new Date().getMonth()), // JavaScript months are 0-11, so add 1
      year: ValidationSchema.year.default(new Date().getFullYear()),
    }),
  },
};
