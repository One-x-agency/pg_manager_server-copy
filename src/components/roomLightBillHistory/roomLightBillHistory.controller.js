const RoomLightBillHistoryService = require('./roomLightBillHistory.service');
const ServerError = require('../../utility/serverError');
const RoomService = require('../room/room.service');
const FileStorageService = require('@/service/fileStorage');

// #region Create
exports.create = async (req, res, next) => {
  const { id } = req.user;
  const { roomId } = req.query;
  const { file } = req;
  const { pgId } = req.params;
  let imageFileName;

  try {
    if (file) imageFileName = FileStorageService.saveFile(file.filename);

    const result = await RoomLightBillHistoryService.create(pgId, roomId, id, { ...req.body, image: imageFileName });
    result.image = FileStorageService.generateUrl(imageFileName);

    res.status(200).json(result);

    RoomService.calculateRoomLightBill(pgId, roomId);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region List
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  const { roomId } = req.query;

  try {
    const result = await RoomLightBillHistoryService.list(pgId, roomId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region Update
exports.update = async (req, res, next) => {
  const { id } = req.user;
  const { file } = req;
  const { roomLightBillId, pgId } = req.params;

  try {
    const data = await RoomLightBillHistoryService.getById(pgId, roomLightBillId);
    if (!data) throw new ServerError('NOT_FOUND', 'Room Light Bill not found');

    if (file) {
      const imageFileName = FileStorageService.saveFile(file.filename);
      req.body.image = imageFileName;
    } else if (req.body.image === '') {
      if (data.image) FileStorageService.delete(data.image);
      req.body.image = null;
    } else {
      req.body.image = data.image;
    }

    const result = await RoomLightBillHistoryService.update(id, pgId, roomLightBillId, req.body);
    result.image = FileStorageService.generateUrl(result.image);
    res.status(200).json(result);
    RoomService.calculateRoomLightBill(pgId, result.roomId);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region Delete
exports.delete = async (req, res, next) => {
  const { id } = req.user;
  const { roomLightBillId, pgId } = req.params;

  try {
    const data = await RoomLightBillHistoryService.getById(pgId, roomLightBillId);
    if (!data) throw new ServerError('NOT_FOUND', 'Room Light Bill not found');
    await RoomLightBillHistoryService.delete(id, roomLightBillId, new Date().toISOString());

    res.status(204).send();
    RoomService.calculateRoomLightBill(pgId, data.roomId);
  } catch (err) {
    next(err);
  }
};
// #endregion
