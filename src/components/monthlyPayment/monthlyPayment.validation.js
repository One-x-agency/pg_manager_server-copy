/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');
const Constants = require('../../config/constant');

const Schema = {
  rent: Joi.number().integer().min(0),
  lightBill: Joi.number().integer().min(0),
  method: Joi.string().valid(...Constants.monthlyPayment.type),
  remark: Joi.string().allow(null, '').max(200),
  month: ValidationSchema.month,
  year: ValidationSchema.year,
};

module.exports = {

  create: {
    query: Joi.object().keys({
      upsert: Joi.boolean().default(false),
    }),
    body: Joi.object().keys({
      guestId: ValidationSchema.uuid.required(),
      rent: Schema.rent.allow(null),
      lightBill: Schema.lightBill.allow(null),
      month: Schema.month.required(),
      year: Schema.year.required(),
      remark: Schema.remark,
      date: Joi.date().iso().required(),
      rentPaymentMethod: Schema.method.when('rent', { is: Joi.number().required(), then: Joi.required() }),
      lightBillPaymentMethod: Schema.method.when('lightBill', { is: Joi.number().required(), then: Joi.required() }),
    }),
  },

  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      monthlyPaymentId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      rent: Schema.rent.allow(null),
      lightBill: Schema.lightBill.allow(null),
      remark: Schema.remark,
      date: Joi.date().iso().required(),
      rentPaymentMethod: Schema.method.when('rent', { is: Joi.exist(), then: Joi.required() }),
      lightBillPaymentMethod: Schema.method.when('lightBill', { is: Joi.exist(), then: Joi.required() }),
    }),
  },

  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      monthlyPaymentId: ValidationSchema.uuid.required(),
    }),
  },

  list: {
    query: Joi.object().keys({
      guestId: ValidationSchema.uuid.required(),
    }),
  },

  exportData: {
    query: Joi.object().keys({
      month: Schema.month.required(),
      year: Schema.year.required(),
    }),
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
    }),
  },

  Schema,
};
