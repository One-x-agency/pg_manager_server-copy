const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

module.exports = {

  create: {
    body: Joi.object().keys({
      amount: Joi.number().integer().min(0).required(),
      date: Joi.date().required(),
      category: Joi.string().max(200).required(),
      description: Joi.string().max(200),
      paymentMethod: Joi.string().max(200).valid('cash', 'bank').required(),
      sender: Joi.string().max(200).required(),
      receiver: Joi.string().max(200).required(),
    }),
  },
  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      expenseId: ValidationSchema.uuid.required(),
    }),
  },
  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      expenseId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      amount: Joi.number().integer().min(0).required(),
      date: Joi.date().required(),
      category: Joi.string().max(200).required(),
      description: Joi.string().max(200),
      paymentMethod: Joi.string().max(200).valid('cash', 'bank').required(),
      sender: Joi.string().max(200).required(),
      receiver: Joi.string().max(200).required(),
    }),
  },
  exportData: {
    query: Joi.object().keys({
      month: Joi.number().integer().min(0).max(11)
        .required(),
      year: Joi.number().integer().min(2000).max(2100)
        .required(),
    }),
  },
};
