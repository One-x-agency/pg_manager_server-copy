const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');
const Constants = require('../../config/constant');

const editableColumns = [
  'name',
  'phone',
  'gender',
  'sharing',
  'message',
  'token',
  'status',
];

const Schema = {
  name: Joi.string().max(50),
  token: Joi.number().min(0).max(100000),
  message: Joi.string().max(500).allow(null, ''),
  status: Joi.string().valid(...Constants.inquiry.status),
  sharing: Joi.number().integer().min(1).max(9),
};

module.exports = {
  create: {
    body: Joi.object().keys({
      name: Schema.name.required(),
      phone: ValidationSchema.phone.required(),
      gender: ValidationSchema.gender.required(),
      sharing: Schema.sharing.required(),
      token: Schema.token.allow(null),
      message: Schema.message.default(null),
      status: Schema.status.default('pending'),
    }),
  },
  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      inquiryId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      name: Schema.name,
      phone: ValidationSchema.phone,
      gender: ValidationSchema.gender,
      sharing: Schema.sharing,
      token: Schema.token.allow(null),
      message: Schema.message,
      status: Schema.status,
    }).or(...editableColumns)
      .options({ allowUnknown: false }),

  },
  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      inquiryId: ValidationSchema.uuid.required(),
    }),
  },
};
