const ExpenseDal = require('./expense.dal');
const Database = require('../../service/database');

// #region create
exports.create = async (pgId, id, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await ExpenseDal.create(dbClient, pgId, id, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await ExpenseDal.list(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (pgId, userId, expenseId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    await ExpenseDal.update(dbClient, pgId, userId, expenseId, data);
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region delete

exports.delete = async (pgId, userId, expenseId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await ExpenseDal.delete(dbClient, pgId, userId, expenseId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region exportData
exports.exportData = async (pgId, month, year) => {
  const dbClient = await Database.pool.connect();
  try {
    const expenseData = await ExpenseDal.expenseData(dbClient, pgId, month, year);

    const cashExpenses = expenseData
      .filter((expense) => expense.paymentMethod === 'cash')
      .map((expense) => ({
        category: expense.category,
        amount: expense.totalAmount,
      }));

    const bankExpenses = expenseData
      .filter((expense) => expense.paymentMethod === 'bank')
      .map((expense) => ({
        category: expense.category,
        amount: expense.totalAmount,
      }));
    const incomeData = await ExpenseDal.incomeData(dbClient, pgId, month, year);

    return { bankExpenses, cashExpenses, incomeData };
  } finally {
    dbClient.release();
  }
};

// #endregion
