const Joi = require('joi');
const Schema = require('../../config/validationSchema');

module.exports = {

  create: {
    body: Joi.object().keys({
      name: Joi.string().min(2).max(100).required(),
      type: Schema.pg.type.required(),
      phone: Joi.string().min(10).max(10).required(),
      email: Joi.string().email().allow(null),
      address: Joi.string().min(10).max(1000).required(),
    }),
  },

  getOne: {
    params: Joi.object().keys({
      pgId: Schema.uuid.required(),
    }),
  },

  login: {
    body: Joi.object().keys({
      emailOrPhone: Joi.alternatives().try(Joi.string().email(), Joi.string().min(10).max(10)).required(),
      password: Joi.string().required(),
    }),
  },

  codeValidationSchema: {
    params: Joi.object().keys({
      code: Schema.pg.code.required(),
    }),
  },

  updatePg: {
    params: Joi.object().keys({
      pgId: Schema.uuid.required(),
    }),

    body: Joi.object().keys({
      name: Joi.string().min(2).max(100),
      type: Schema.pg.type,
      phone: Joi.string().min(10).max(10),
      email: Joi.string().email().allow(null),
      address: Joi.string().min(10).max(1000),
      meta: Joi.object(),
    }),
  },

  delete: {
    body: Joi.object().keys({
      password: Joi.string().required(),
    }),
  },

};
