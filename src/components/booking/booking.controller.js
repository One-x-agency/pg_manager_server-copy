const BookingService = require('./booking.service');

// #region create
exports.create = async (req, res, next) => {
  const { pgId } = req.params;
  const { id } = req.user;
  const { inquiryId } = req.query;
  try {
    const result = await BookingService.create(pgId, id, req.body, inquiryId);
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
    const result = await BookingService.list(pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// #endregion

// #region update

exports.update = async (req, res, next) => {
  const { pgId, bookingId } = req.params;
  const { id } = req.user;
  try {
    await BookingService.update(pgId, bookingId, id, req.body);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

// #endregion

// #region delete

exports.delete = async (req, res, next) => {
  const { pgId, bookingId } = req.params;
  const { id } = req.user;
  try {
    await BookingService.delete(pgId, id, bookingId);
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
    const result = await BookingService.exportData(pgId, month, year);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
