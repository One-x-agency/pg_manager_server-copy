const bcrypt = require('bcryptjs');
const Dal = require('./token.dal');
const Database = require('../../service/database');

// #region InsertOne
exports.insertOne = async ({ token, userId = null, expireAt, otp = null }) => {
  const dbClient = await Database.pool.connect();
  try {
    const otpHash = await bcrypt.hash(otp.toString(), 10);
    const result = await Dal.create(dbClient, { token, userId, expireAt, otp: otpHash });
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region FindByToken
exports.findByToken = async (token) => {
  const dbClient = await Database.pool.connect();
  const currentTimeStamp = new Date().toISOString();
  try {
    const result = await Dal.findByToken(dbClient, token, currentTimeStamp);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
