const ReminderService = require('./reminder.service');

// #region upsertMonthlyReminder
exports.upsert = async (req, res, next) => {
  const { id: userId } = req.user;
  const { pgId } = req.params;
  const data = req.body;
  try {
    const result = await ReminderService.upsert(pgId, userId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  try {
    const result = await ReminderService.list();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
