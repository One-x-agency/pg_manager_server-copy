const CityService = require('./city.service');

// #region list
exports.list = async (req, res, next) => {
  try {
    const result = await CityService.listCitiesByStateId(req.query.stateId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
