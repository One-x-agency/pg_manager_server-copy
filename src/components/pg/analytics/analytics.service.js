const AnalyticsDal = require('./analytics.dal');
const Database = require('../../../service/database');

exports.analytics = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await AnalyticsDal.analytics(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
