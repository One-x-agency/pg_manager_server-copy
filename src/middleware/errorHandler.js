const expressValidation = require('express-validation');
const ServerError = require('../utility/serverError');
const Logger = require('../lib/logger');
const { errorCodes } = require('../config/constant');

const convertValidationError = (err) => {
  const error = {};

  Object.keys(err.details).forEach((location) => {
    error[location] = {};
    err.details[location].forEach((e) => {
      error[location][e.path[0]] = e.message;
    });
  });

  return {
    httpStatusCode: err.statusCode,
    body: { code: 'validation_error', message: 'parameters are not valid', error },
  };
};

const errorHandler = (err, req, res, next) => {
  Logger.error(err.message || err.code, { stack: err.stack });

  if (err instanceof expressValidation.ValidationError) {
    const validationErrorObj = convertValidationError(err);
    Logger.warn({ message: 'ValidationError', stack: JSON.stringify(validationErrorObj.body.errors) });
    return res.status(validationErrorObj.httpStatusCode).json(validationErrorObj.body);
  }

  if (err instanceof ServerError) {
    const errorInfo = err.info();
    if (errorInfo) return res.status(errorInfo.httpStatusCode).json(errorInfo.body);
  }

  if (err.code) {
    const errorInfo = errorCodes.postgres[err.code];
    if (errorInfo) {
      const body = { ...errorInfo.body };
      if (err.detail) body.message = err.detail;
      return res.status(errorInfo.httpStatusCode).json(body);
    }
  }

  const errorInfo = errorCodes.server.INTERNAL_SERVER_ERROR;

  return res.status(errorInfo.httpStatusCode).json(errorInfo.body);
};

module.exports = errorHandler;
