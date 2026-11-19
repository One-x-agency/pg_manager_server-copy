const StaffDal = require('./staff.dal');
const Database = require('../../service/database');
// const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (userId, pgId, data) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await StaffDal.create(dbClient, userId, pgId, data);
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
    const result = await StaffDal.list(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region getStaffById
exports.getStaffById = async (pgId, staffId) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await StaffDal.getStaffById(dbClient, pgId, staffId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (userId, pgId, staffId, data) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await StaffDal.update(dbClient, userId, pgId, staffId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region delete
exports.delete = async (userId, pgId, staffId) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await StaffDal.delete(dbClient, pgId, userId, staffId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region UploadDocument
exports.uploadDocument = async (pgId, staffId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await StaffDal.uploadDocument(dbClient, pgId, staffId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region DeleteDocument
exports.deleteDocument = async (pgId, documentId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = StaffDal.getDocumentById(dbClient, pgId, documentId);
    if (result) await StaffDal.deleteDocument(dbClient, pgId, documentId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
