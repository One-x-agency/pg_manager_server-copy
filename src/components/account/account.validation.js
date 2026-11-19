const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

module.exports = {
  verifyEmail: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      phone: ValidationSchema.phone.required(),
    }),
  },

  register: {
    body: Joi.object().keys({
      token: Joi.string().required(),
      otp: Joi.number().required(),
      name: Joi.string().required(),
      phone: Joi.string().min(10).max(10).required(),
      password: Joi.string().required(),
    }),
  },

  login: {
    body: Joi.object().keys({
      emailOrPhone: Joi.alternatives().try(Joi.string().email(), Joi.string().min(10).max(10)).required(),
      password: Joi.string().required(),
      longLived: Joi.boolean().default(false),
    }),
  },

  loginToPg: {
    params: Joi.object().keys({
      pgIdOrCode: Joi.alternatives().try(
        ValidationSchema.uuid,
        ValidationSchema.pg.code,
      ).required(),
    }),
  },

  changePassword: {
    body: Joi.object().keys({
      password: ValidationSchema.account.password.required(),
      newPassword: Joi.string().min(8).max(30).required(),
    }),
  },

  forgotPassword: {
    body: Joi.object().keys({
      emailOrPhone: Joi.alternatives().try(Joi.string().email(), Joi.string().min(10).max(10)).required(),
      redirectUrl: Joi.string().uri().required(),
    }),
  },

  resetPassword: {
    body: Joi.object().keys({
      token: Joi.string().required(),
      password: ValidationSchema.account.password.required(),
    }),
  },

  deleteAccount: {
    body: Joi.object().keys({
      password: ValidationSchema.account.password.required(),
    }),
  },

  loginWithGoogle: {
    body: Joi.object().keys({
      accessToken: Joi.string().required(),
    }),
  },

  completeAccountRegistration: {
    body: Joi.object().keys({
      token: Joi.string().required(),
      phone: Joi.string().min(10).max(10).required(),
    }),
  },

};
