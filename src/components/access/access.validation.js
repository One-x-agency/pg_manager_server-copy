const Joi = require('joi');
const GuestValidation = require('../guest/guest.validation');
const ValidationSchema = require('../../config/validationSchema');

module.exports = {

  getInfo: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
  },

  update: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
    body: Joi.object().keys({
      emergencyPhone: ValidationSchema.phone.required(),
      address: GuestValidation.schema.address.required(),
      email: Joi.string().email().allow(null),
    }),
  },

  uploadProfile: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
  },

  uploadDocument: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().max(200).required(),
    }),
  },

  deleteDocument: {
    query: Joi.object().keys({
      token: Joi.string().required(),
    }),
    params: Joi.object().keys({
      documentId: Joi.string().required(),
    }),
  },

};
