/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const ValidationSchema = require('../../config/validationSchema');

const editableColumns = [
  'name',
  'phone',
  'email',
  'deposit',
  'rent',
  'gender',
  'sharing',
  'roomId',
  'checkInDate',
  'checkOutDate',
  'emergencyPhone',
  'address',
  'info',
  'checkInReading',
  'checkOutReading',
  'dateOfNotice',
];

const Schema = {
  name: Joi.string().max(200),
  email: ValidationSchema.email,
  phone: ValidationSchema.phone,
  gender: ValidationSchema.gender,
  sharing: Joi.number().integer().min(1).max(9),
  address: Joi.string().max(1200),
  rent: Joi.number().integer().min(0),
  checkInReading: Joi.number().min(0),
  checkOuReading: Joi.number().min(0),
  deposit: Joi.number().integer().min(0),
  info: Joi.string().max(1500),
};

module.exports = {

  create: {
    body: Joi.object().keys({
      name: Schema.name.required(),
      phone: Schema.phone.required(),
      gender: Schema.gender.required(),
      sharing: Schema.sharing.required(),
      roomId: ValidationSchema.uuid.required(),
      rent: Schema.rent.required(),
      deposit: Schema.deposit.required(),
      checkInDate: Joi.date().required(),
      emergencyPhone: Schema.phone.required(),
      email: Schema.email.allow(null, ''),
      checkInReading: Schema.checkInReading.allow(null),
      dateOfNotice: Joi.date()
        .allow(null)
        .min(Joi.ref('checkInDate'))
        .allow(null),
      checkOutDate: Joi.date()
        .min(Joi.ref('checkInDate'))
        .when('dateOfNotice', {
          is: Joi.exist(),
          then: Joi.date().min(Joi.ref('dateOfNotice')),
        })
        .allow(null),
      address: Schema.address,
      info: Schema.info.allow(null, ''),
      redirectUrl: Joi.string().allow('').required(),
    }),
    query: Joi.object().keys({
      bookingId: ValidationSchema.uuid,
      inquiryId: ValidationSchema.uuid,
    }),
  },

  list: {
    query: Joi.object().keys({
      isDeleted: Joi.boolean().default(false),
    }),
  },

  getGuestById: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      guestId: ValidationSchema.uuid.required(),
    }),
  },

  update: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      guestId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      name: Schema.name.required(),
      phone: Schema.phone.required(),
      deposit: Schema.deposit.min(0).required(),
      rent: Schema.rent.required(),
      gender: Schema.gender.required(),
      sharing: Schema.sharing.required(),
      checkInDate: Joi.date().required(),
      emergencyPhone: Schema.phone.required(),
      email: Schema.email.allow(null, ''),
      checkInReading: Schema.checkInReading.allow(null),
      checkOuReading: Schema.checkOuReading.allow(null).min(Joi.ref('checkInReading')),
      dateOfNotice: Joi.date()
        .allow(null)
        .min(Joi.ref('checkInDate'))
        .allow(null),
      checkOutDate: Joi.date()
        .min(Joi.ref('checkInDate'))
        .when('dateOfNotice', {
          is: Joi.exist(),
          then: Joi.date().min(Joi.ref('dateOfNotice')),
        })
        .allow(null),
      address: Schema.address.allow(null, ''),
      info: Schema.info.allow(null, ''),
      roomId: ValidationSchema.uuid,
    }).or(...editableColumns)
      .options({ allowUnknown: false }),
  },

  verifyNumber: {
    body: Joi.object().keys({
      pgCode: ValidationSchema.pg.code.required(),
      phone: ValidationSchema.phone.required(),
    }),
  },

  delete: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      guestId: ValidationSchema.uuid.required(),
    }),
  },

  uploadDocument: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      guestId: ValidationSchema.uuid.required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().max(200).required(),
    }),

  },

  deleteDocument: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      documentId: ValidationSchema.uuid.required(),
    }),
  },

  updateOrDeleteProfile: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
      guestId: ValidationSchema.uuid.required(),
    }),
  },
  // add month and year in query
  exportData: {
    params: Joi.object().keys({
      pgId: ValidationSchema.uuid.required(),
    }),
    query: Joi.object().keys({
      month: ValidationSchema.month.required(),
      year: ValidationSchema.year.required(),
    }),
  },

  schema: Schema,

};
