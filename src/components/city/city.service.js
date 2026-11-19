const CityDal = require('./city.dal');
const Database = require('../../service/database');

// #region listCitiesByStateId
exports.listCitiesByStateId = async (stateId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await CityDal.listCitiesByStateId(dbClient, stateId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
