const RoomService = require('./room.service');

// #region create
exports.create = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    const { id } = req.user;
    const result = await RoomService.create(pgId, id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region updateRoomById
exports.updateRoomById = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { roomId, pgId } = req.params;
    const data = req.body;
    await RoomService.updateRoomById(pgId, id, roomId, data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { pgId } = req.params;
  const { guestId } = req.query;
  let result;
  try {
    if (guestId) result = await RoomService.getRoomById(pgId, guestId);
    else result = await RoomService.list(pgId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region getOne
exports.getOne = async (req, res, next) => {
  const { roomId, pgId } = req.params;
  try {
    const result = await RoomService.getRoomById(pgId, roomId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region deleteRoomById
exports.deleteRoomById = async (req, res, next) => {
  const { roomId, pgId } = req.params;

  try {
    await RoomService.deleteRoomById(pgId, roomId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
// #endregion

// #region roomDataExport
exports.roomDataExport = async (req, res, next) => {
  const { pgId } = req.params;
  try {
    const result = await RoomService.exportRoomData(pgId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// #endregion
