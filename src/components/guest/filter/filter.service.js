const Database = require('../../../service/database');
const MonthlyPaymentViewDal = require('./filter.dal');

exports.getViewData = async (month, year, pdId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentViewDal.getViewData(
      dbClient,
      month,
      year,
      pdId,
    );
    return result;
  } finally {
    dbClient.release();
  }
};
