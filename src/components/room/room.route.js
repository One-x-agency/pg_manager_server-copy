const express = require('express');
const { validate } = require('../../utility/validationHelper');
const RoomValidation = require('./room.validation');
const RoomController = require('./room.controller');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.create'),
    validate(RoomValidation.create),
    RoomController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.read'),
    validate(RoomValidation.list),
    RoomController.list,
  );

router.route('/export')
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.read'),
    RoomController.roomDataExport,
  );

router.route('/:roomId')
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.read'),
    validate(RoomValidation.getOne),
    RoomController.getOne,
  )
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.update'),
    validate(RoomValidation.update),
    RoomController.updateRoomById,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.delete'),
    validate(RoomValidation.delete),
    RoomController.deleteRoomById,
  );

module.exports = router;
