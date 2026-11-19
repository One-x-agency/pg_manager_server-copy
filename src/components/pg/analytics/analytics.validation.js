const Joi = require('joi');
const Schema = require('../../../config/validationSchema');

module.exports = {
  analytics: {
    params: Joi.object({
      pgId: Schema.uuid.required(),
    }),
  },
};
