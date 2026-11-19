const env = require('./env');

module.exports = {
  env: env.env,
  port: env.port,
  jwtSecret: env.jwtSecret,
  masterKey: env.masterKey,

  database: {
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbDatabase,
  },

  whatsApp: {
    phoneNumberId: env.whatsAppPhoneNumberId,
    token: env.whatsAppToken,
  },

  email: {
    id: env.emailId,
    password: env.emailPassword,
    smtpHost: env.smtpHost,
    smtpPort: env.smtpPort,
  },

  aws: {
    region: env.awsRegion,
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
    s3: {
      bucket: env.awsS3BucketName,
    },
  },

  loggerOptions: {
    env: env.env,
    consoleLogLevel: env.consoleLogLevel,
    fileLogLevel: env.fileLogLevel,
    appName: env.serviceName,
  },
};
