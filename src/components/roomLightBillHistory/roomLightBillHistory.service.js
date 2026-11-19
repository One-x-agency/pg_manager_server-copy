const RoomLightBillHistoryDal = require('./roomLightBillHistory.dal');
const Database = require('../../service/database');

// #region create
/**
 * @returns {Promise<{
 * id: string,
 * roomId: string,
 * image: string,
 * date: string,
 * reading: string,
 * rate: number,
 * amount: number
 * }}
 */

exports.create = async (pgId, roomId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await RoomLightBillHistoryDal.create(dbClient, pgId, roomId, userId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
/**
 * @returns {Promise<{
 * id: string,
 * roomId: string,
 * image: string,
 * date: string,
 * rate: number,
 * reading: string,
 * amount: number
 * }}
 */

exports.list = async (pgId, roomId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await RoomLightBillHistoryDal.list(dbClient, pgId, roomId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
/**
 * @returns {Promise<{
 * id: string,
 * roomId: string,
 * image: string,
 * date: string,
 * reading: string,
 * rate: number,
 * amount: number,
 * }}
 */
exports.update = async (userId, pgId, roomLightBillId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await RoomLightBillHistoryDal.update(dbClient, userId, pgId, roomLightBillId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region delete
exports.delete = async (userId, roomLightBillId, deletedAt) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await RoomLightBillHistoryDal.delete(dbClient, userId, roomLightBillId, deletedAt);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region getById
exports.getById = async (pgId, roomLightBillId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await RoomLightBillHistoryDal.getById(dbClient, pgId, roomLightBillId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
