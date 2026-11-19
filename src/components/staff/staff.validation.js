const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

const editableColumns = [
  'name',
  'phone',
  'type',
  'info',
  'gender',
];
module.exports = {

  create: {
    body: Joi.object({
      name: Joi.string().min(3).max(30).required(),
      gender: ValidationSchema.gender.required(),
      phone: ValidationSchema.phone.required(),
      type: Joi.string().required(),
      info: Joi.string().max(2000).allow(null, ''),
    }),
  },

  getStaffById: {
    params: Joi.object().keys({
      staffId: ValidationSchema.uuid.required(),
      pgId: ValidationSchema.uuid.required(),
    }),
  },

  update: {
    params: Joi.object().keys({
      staffId: ValidationSchema.uuid.required(),
      pgId: ValidationSchema.uuid.required(),

    }),
    body: Joi.object().keys({
      name: Joi.string().min(3).max(30),
      gender: ValidationSchema.gender,
      phone: ValidationSchema.phone,
      type: Joi.string(),
      info: Joi.string().max(2000).allow(null, ''),

    }).or(...editableColumns)
      .options({ allowUnknown: false }),

  },

  delete: {
    params: Joi.object().keys({
      staffId: ValidationSchema.uuid.required(),
      pgId: ValidationSchema.uuid.required(),

    }),
  },

  uploadDocument: {
    params: Joi.object().keys({
      staffId: ValidationSchema.uuid.required(),
      pgId: ValidationSchema.uuid.required(),

    }),
    body: Joi.object().keys({
      name: Joi.string().max(200).required(),
    }),
  },

  deleteDocument: {
    params: Joi.object().keys({
      documentId: ValidationSchema.uuid.required(),
      pgId: ValidationSchema.uuid.required(),
    }),

  },

};
