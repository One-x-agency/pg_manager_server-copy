const AnalyticsService = require('./analytics.service');

exports.analytics = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await AnalyticsService.analytics(pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
