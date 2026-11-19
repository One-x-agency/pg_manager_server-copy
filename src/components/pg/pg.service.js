const PgDal = require('./pg.dal');
const Database = require('../../service/database');
const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (accountId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    await dbClient.query('BEGIN');
    const pg = await PgDal.create(dbClient, accountId, data);
    await dbClient.query('COMMIT');
    return pg;
  } catch (error) {
    await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async (user) => {
  const { isRootUser = false, id, accountId } = user;
  const dbClient = await Database.pool.connect();
  try {
    if (isRootUser) return await PgDal.listForRootUser(dbClient, accountId);
    const result = await PgDal.listForUser(dbClient, id);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region checkCodeValidity
exports.checkCodeValidity = async (code) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await PgDal.getPgCode(dbClient, code);
    if (result) throw new ServerError('DUPLICATE_KEY_VALUE', 'Code already exists');
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region findByPgId
exports.findByPgId = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await PgDal.findByPgId(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (pgId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await PgDal.update(dbClient, pgId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region Soft Delete
exports.softDelete = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await PgDal.softDelete(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
