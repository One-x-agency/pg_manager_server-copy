const Joi = require('joi');
const validationSchema = require('../../config/validationSchema');

module.exports = {
  list: {
    query: Joi.object({
      stateId: validationSchema.uuid.required(),
    }),
  },
};
