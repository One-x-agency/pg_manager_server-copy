const Database = require('../../service/database');
const InquiryDal = require('./inquiry.dal');

// #region create
exports.create = async (pgId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await InquiryDal.create(dbClient, pgId, userId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await InquiryDal.list(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update

exports.update = async (pgId, userId, inquiryId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    await InquiryDal.update(dbClient, pgId, userId, inquiryId, data);
  } finally {
    dbClient.release();
  }
};

// #endregion

// #region Delete
exports.delete = async (pgId, id, inquiryId) => {
  const dbClient = await Database.pool.connect();
  try {
    await InquiryDal.delete(dbClient, pgId, id, inquiryId);
  } finally {
    dbClient.release();
  }
};
