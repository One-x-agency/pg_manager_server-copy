/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const Constants = require('../../config/constant');
const ValidationSchema = require('../../config/validationSchema');

const Schema = {
  name: Joi.string().min(1).max(8),
  capacity: Joi.number().integer().min(1).max(9),
  rent: Joi.number().integer().min(0),
  tags: Joi.array()
    .items(Joi.string().valid(...Constants.room.tags))
    .unique()
    .max(5),
  info: Joi.string().allow(null, '').max(1000),
};

module.exports = {

  create: {
    body: Joi.object().keys({
      name: Schema.name.required(),
      capacity: Schema.capacity.required(),
      rent: Schema.rent.required(),
      tags: Schema.tags.required(),
      info: Schema.info,
    }),
  },

  list: {
    query: Joi.object().keys({
      guestId: ValidationSchema.uuid,
    }),
  },

  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      name: Schema.name.required(),
      capacity: Schema.capacity.required(),
      rent: Schema.rent.required(),
      tags: Schema.tags.required(),
      info: Schema.info,
    }),
  },

  getOne: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomId: ValidationSchema.uuid.required(),
    }),
  },

  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomId: ValidationSchema.uuid.required(),
    }),
  },

  calculateRoomLightBill: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      roomId: ValidationSchema.uuid.required(),
    }),
    query: Joi.object().keys({
      month: ValidationSchema.month.required(),
      year: ValidationSchema.year.required(),
    }),
  },

  Schema,

};
