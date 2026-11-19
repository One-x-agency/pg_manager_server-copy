/* eslint-disable newline-per-chained-call */
const Joi = require('joi');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
  override: true,
});

const env = {
  env: process.env.NODE_ENV || 'local',
  port: process.env.SERVER_PORT || 3007,
  serviceName: process.env.SERVICE_NAME || 'PG Management',
  jwtSecret: process.env.JWT_SECRET,
  masterKey: process.env.MASTER_KEY,

  // Database
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbDatabase: process.env.DB_NAME,

  // WhatsApp
  whatsAppPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsAppToken: process.env.WHATSAPP_TOKEN,

  // Email
  emailId: process.env.EMAIL_ID,
  emailPassword: process.env.EMAIL_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,

  // Log levels
  consoleLogLevel: process.env.CONSOLE_LOG_LEVEL || 'info',
  fileLogLevel: process.env.FILE_LOG_LEVEL || 'false',

  // aws
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
};

// Define validation for all the env vars
const envSchema = Joi.object({
  env: Joi.string().required().valid('local', 'dev', 'stage', 'prod'),
  port: Joi.number().required().min(0).max(65535),
  serviceName: Joi.string().required().min(3).max(255),
  jwtSecret: Joi.string().required().min(3).max(1024),
  masterKey: Joi.string().min(3).max(1024),

  // Database
  dbHost: Joi.string().required().min(3).max(255),
  dbPort: Joi.number().required().min(1024).max(65535),
  dbUser: Joi.string().required().min(3).max(255),
  dbPassword: Joi.string().allow(''),
  dbDatabase: Joi.string().required().min(3).max(255),

  // WhatsApp
  whatsAppPhoneNumberId: Joi.string().required().min(3).max(255),
  whatsAppToken: Joi.string().required().min(3).max(1024),

  // Email
  emailId: Joi.string().email().required().min(3).max(255),
  emailPassword: Joi.string().required().min(3).max(255),
  smtpHost: Joi.string().required().min(3).max(255),
  smtpPort: Joi.number().required().min(0).max(65535),

  // Log levels
  consoleLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),
  fileLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),

  // aws
  awsAccessKeyId: Joi.string().required().min(16).max(128),
  awsSecretAccessKey: Joi.string().required().min(16).max(128),
  awsRegion: Joi.string().required().min(3).max(20),
  awsS3BucketName: Joi.string().required().min(3).max(63),
});

// Validate env vars
const { error } = envSchema.validate(env);

// Throw an error if env vars are not valid
if (error) throw new Error(`ENV validation error: ${error.message}`);

module.exports = env;
