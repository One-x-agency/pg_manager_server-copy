const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

const Schema = {
  month: ValidationSchema.month.required(),
  year: ValidationSchema.year.required(),
  reading: Joi.number().integer().min(0),
  amount: Joi.number().integer().min(0),
  unitPrice: Joi.number().min(0),
};

module.exports = {

  create: {
    body: Joi.object().keys({
      month: Schema.month.required(),
      year: Schema.year.required(),
      reading: Schema.reading.required(),
      amount: Schema.amount.required(),
      unitPrice: Schema.unitPrice.required(),
    }),
    query: Joi.object().keys({
      roomId: ValidationSchema.uuid.required(),
    }),
  },

  list: {
    query: Joi.object().keys({
      roomId: ValidationSchema.uuid.required(),
    }),
  },

  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomLightBillId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      image: Joi.string().valid(''),
      reading: Schema.reading.required(),
      amount: Schema.amount.required(),
      unitPrice: Schema.unitPrice.required(),
    }),
  },

  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomLightBillId: ValidationSchema.uuid.required(),
    }),
  },

  Schema,

};
