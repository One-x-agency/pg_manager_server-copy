const MonthlyPaymentService = require('./filter.service');

exports.getViewData = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await MonthlyPaymentService.getViewData(req.query.month, req.query.year, pgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
