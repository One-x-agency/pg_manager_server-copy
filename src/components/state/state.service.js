const StateDal = require('./state.dal');
const Database = require('../../service/database');

// #region listStatesByCountryId
exports.listStatesByCountryId = async (countryId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await StateDal.listStatesByCountryId(dbClient, countryId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
