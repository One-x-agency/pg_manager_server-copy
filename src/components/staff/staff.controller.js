const ServerError = require('../../utility/serverError');
const StaffService = require('./staff.service');
const AWS = require('../../service/aws');

// #region create
exports.create = async (req, res, next) => {
  const { pgId } = req.params;
  const { id } = req.user;
  try {
    const result = await StaffService.create(id, pgId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await StaffService.list(pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region getStaffById
exports.getStaffById = async (req, res, next) => {
  const { staffId, pgId } = req.params;
  try {
    const result = await StaffService.getStaffById(pgId, staffId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  const { id } = req.user;
  const { staffId, pgId } = req.params;
  const data = req.body;
  try {
    await StaffService.update(id, pgId, staffId, data);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region delete
exports.delete = async (req, res, next) => {
  const { id } = req.user;
  const { staffId, pgId } = req.params;
  try {
    await StaffService.delete(id, pgId, staffId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region UploadDocument
exports.uploadDocument = async (req, res, next) => {
  try {
    const { staffId, pgId } = req.params;
    const { file } = req;
    const { name } = req.body;

    if (!file) throw new ServerError('INVALID_DATA', 'File not found');

    const s3Key = `public/${req.user.accountId}/${pgId}/${file.path.split('/').pop()}`;
    await AWS.uploadFileToS3(file, s3Key);

    const result = await StaffService.uploadDocument(pgId, staffId, { name, image: s3Key });
    result.image = AWS.generateS3Url(s3Key);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region DeleteDocument
exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentId, pgId } = req.params;
    const result = await StaffService.deleteDocument(pgId, documentId);
    if (!result) throw new ServerError('NOT_FOUND', 'Document not found');
    console.log(result.image);
    await AWS.deleteFromS3(result.image);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion
