const CountryDal = require('./country.dal');
const Database = require('../../service/database');

// #region list
exports.list = async () => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await CountryDal.list(dbClient);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
