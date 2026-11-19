const MonthlyPaymentService = require('./monthlyPayment.service');

// #region create
exports.createOrUpsert = async (req, res, next) => {
  const { id: userId } = req.user;
  const data = req.body;
  const { pgId } = req.params;
  const { upsert } = req.query;
  try {
    if (upsert) {
      const result = await MonthlyPaymentService.upsert(pgId, userId, data);
      res.status(200).json(result);
    } else {
      const result = await MonthlyPaymentService.create(pgId, userId, data);
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await MonthlyPaymentService.listByGuestId(pgId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  const { id } = req.user;
  const { monthlyPaymentId, pgId } = req.params;
  const data = req.body;
  try {
    await MonthlyPaymentService.update(pgId, id, monthlyPaymentId, data);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region delete
exports.delete = async (req, res, next) => {
  const { id } = req.user;
  const { monthlyPaymentId, pgId } = req.params;
  try {
    const result = await MonthlyPaymentService.delete(pgId, id, monthlyPaymentId);
    res.status(204).json(result);
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
    const result = await MonthlyPaymentService.exportData(pgId, month, year);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// #endregion
