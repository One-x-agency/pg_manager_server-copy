const ReminderDal = require('./reminder.dal');
const Database = require('../../service/database');

// #region upsertMonthlyReminder
exports.upsert = async (pgId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await ReminderDal.upsert(dbClient, pgId, userId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async () => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await ReminderDal.list(dbClient);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
