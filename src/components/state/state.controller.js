const StateService = require('./state.service');

// #region list
exports.list = async (req, res, next) => {
  try {
    const result = await StateService.listStatesByCountryId(req.query.countryId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
