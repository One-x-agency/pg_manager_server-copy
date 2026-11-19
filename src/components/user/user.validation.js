const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

module.exports = {

  create: {
    body: Joi.object({
      username: ValidationSchema.user.username.required(),
      password: ValidationSchema.user.password.required(),
      phone: ValidationSchema.phone.required(),
      pgId: ValidationSchema.uuid,
      permission: ValidationSchema.user.permission.default(),
    }),
  },

  list: {
    query: Joi.object({
      pgId: ValidationSchema.uuid,
    }),
  },

  login: {
    params: Joi.object({
      accountNumber: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      usernameOrPhone: Joi.string().min(3).max(30).required(),
      password: Joi.string().required(),
      longLived: Joi.boolean().default(false),
    }),
  },

  update: {
    params: Joi.object({
      userId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object({
      username: ValidationSchema.user.username.required(),
      password: ValidationSchema.user.password,
      phone: ValidationSchema.phone.required(),
    }),
  },

  delete: {
    params: Joi.object({
      userId: ValidationSchema.uuid.required(),
    }),
  },

  updateUserPermission: {
    body: Joi.object({
      pgId: ValidationSchema.uuid.required(),
      permission: ValidationSchema.user.permission.default(),
    }),
  },

  deletePermission: {
    body: Joi.object({
      pgId: ValidationSchema.uuid.required(),
    }),
  },

  fetchUserPermissionsForPg: {
    query: Joi.object({
      pgId: ValidationSchema.uuid.required(),
    }),
  },

  getUserById: {
    params: Joi.object({
      userId: ValidationSchema.uuid.required(),
    }),
  },

};
