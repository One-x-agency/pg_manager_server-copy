const Joi = require('joi');
// const Vars = require('./var');
const Constants = require('./constant');

module.exports = {
  uuid: Joi.string().guid({ version: 'uuidv4' }),
  gender: Joi.string().valid('male', 'female'),
  phone: Joi.string().min(10).max(10),
  email: Joi.string().email(),
  month: Joi.number().min(0).max(11),
  year: Joi.number().integer().min(2000).max(3000),

  account: {
    password: Joi.string().min(3).max(30),
  },

  user: {
    username: Joi.string()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(25)
      .messages({
        'string.pattern.base': 'Username must contain only alphanumeric characters and underscore',
      }),

    password: Joi.string().min(5).max(30),

    permission: Joi.object({

      guest: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

      room: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

      inquiry: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

      booking: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

      expense: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

      staff: Joi.object({
        read: Joi.boolean().default(false),
        create: Joi.boolean().default(false),
        update: Joi.boolean().default(false),
        delete: Joi.boolean().default(false),
      }).default(),

    }),
  },

  pg: {
    code: Joi.string().pattern(/^(?!_)[a-z\d_]+$/),
    type: Joi.string().valid(...Constants.pg.type),
  },
};
