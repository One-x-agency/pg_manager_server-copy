const CountryService = require('./country.service');

// #region list
exports.list = async (req, res, next) => {
  try {
    const result = await CountryService.list();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
