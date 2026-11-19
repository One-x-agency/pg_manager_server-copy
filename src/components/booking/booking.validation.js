/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

const GuestSchema = {
  name: Joi.string().max(200),
  sharing: Joi.number().integer().min(1).max(10),
};

module.exports = {

  create: {
    query: Joi.object().keys({
      inquiryId: ValidationSchema.uuid,
    }),
    body: Joi.object().keys({
      name: GuestSchema.name.required(),
      email: Joi.string().email().allow(null, ''),
      phone: ValidationSchema.phone.required(),
      gender: ValidationSchema.gender.required(),
      sharing: GuestSchema.sharing.required(),
      rent: Joi.number().integer().min(0).required(),
      checkInDate: Joi.date().required(),
      tokenAmount: Joi.number().integer().min(0).required(),
      checkOutDate: Joi.date().allow(null),
      roomId: ValidationSchema.uuid,
    }),
  },

  list: {
    query: Joi.object().keys({
      isDeleted: Joi.boolean().default(false),
    }),
  },

  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      bookingId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      name: GuestSchema.name.required(),
      email: Joi.string().email().allow(null, ''),
      phone: ValidationSchema.phone.required(),
      gender: ValidationSchema.gender.required(),
      sharing: GuestSchema.sharing.required(),
      rent: Joi.number().integer().min(0).required(),
      checkInDate: Joi.date().required(),
      tokenAmount: Joi.number().integer().min(0),
      checkOutDate: Joi.date().allow(null),
      roomId: ValidationSchema.uuid,
    }),
  },

  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      bookingId: ValidationSchema.uuid.required(),
    }),
  },

  schema: GuestSchema,

};
