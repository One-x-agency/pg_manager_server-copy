/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

module.exports = {

  upsert: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      reference: Joi.string().max(200).required(),
      type: Joi.string().valid('monthlyPayment').required(),
      date: Joi.date().allow(null),
      description: Joi.string().allow(null, ''),
    }),
  },

};
