const InquiryService = require('./inquiry.service');

// #region create
exports.create = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { pgId } = req.params;
    const result = await InquiryService.create(pgId, id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await InquiryService.list(pgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region update

exports.update = async (req, res, next) => {
  const { id } = req.user;
  const { pgId } = req.params;
  try {
    await InquiryService.update(pgId, id, req.params.inquiryId, req.body);
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

// #endregion

// #region Delete
exports.delete = async (req, res, next) => {
  const { id } = req.user;
  const { pgId } = req.params;
  try {
    await InquiryService.delete(pgId, id, req.params.inquiryId);
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
