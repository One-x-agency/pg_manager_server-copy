const AccessService = require('./access.service');
const GuestService = require('../guest/guest.service');
const JwtToken = require('../../utility/jwtToken');
const ServerError = require('../../utility/serverError');
const AWS = require('../../service/aws');

exports.getGuestById = async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = JwtToken.decode(token);
    if (!payload) throw new ServerError('INVALID_DATA', 'Invalid token');
    const result = await AccessService.getGuestById(payload.pgId, payload.guestId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.uploadProfile = async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = JwtToken.decode(token);
    if (!payload) throw new ServerError('INVALID_DATA', 'Invalid token');

    const { file } = req;
    const { pgId, guestId } = payload;

    const s3Key = `public/${file.path.split('/').pop()}`;
    await AWS.uploadFileToS3(file, s3Key);

    const result = await GuestService.update(pgId, guestId, { profileImage: s3Key });
    result.profileImage = AWS.generateS3Url(s3Key);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// #region UploadDocument
exports.uploadDocument = async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = JwtToken.decode(token);
    if (!payload) throw new ServerError('INVALID_DATA', 'Invalid token');

    const { guestId, pgId } = payload;
    const { file } = req;
    const { name } = req.body;

    if (!file) throw new ServerError('INVALID_DATA', 'File not found');

    const s3Key = `public/${file.path.split('/').pop()}`;
    await AWS.uploadFileToS3(file, s3Key);

    const result = await GuestService.uploadDocument(pgId, guestId, { name, image: s3Key });
    result.image = AWS.generateS3Url(s3Key);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = JwtToken.decode(token);
    if (!payload) throw new ServerError('INVALID_DATA', 'Invalid token');

    const { guestId, pgId } = payload;
    const data = req.body;

    await GuestService.update(pgId, guestId, data);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region DeleteDocument
exports.deleteDocument = async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = JwtToken.decode(token);
    if (!payload) throw new ServerError('INVALID_DATA', 'Invalid token');

    const { pgId } = payload;
    const result = await GuestService.deleteDocument(pgId, req.params.documentId);
    if (!result) throw new ServerError('NOT_FOUND', 'Document not found');
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion
