const ExpenseService = require('./expense.service');

// #region create
exports.create = async (req, res, next) => {
  const { pgId } = req.params;
  const { id } = req.user;
  try {
    const result = await ExpenseService.create(pgId, id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await ExpenseService.list(pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  const { pgId, expenseId } = req.params;
  const { id } = req.user;
  try {
    await ExpenseService.update(pgId, id, expenseId, req.body);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region delete
exports.delete = async (req, res, next) => {
  const { pgId, expenseId } = req.params;
  const { id } = req.user;
  try {
    await ExpenseService.delete(pgId, id, expenseId);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region exportData
exports.exportData = async (req, res, next) => {
  const { pgId } = req.params;
  const { month, year } = req.query;
  try {
    const result = await ExpenseService.exportData(pgId, month, year);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
