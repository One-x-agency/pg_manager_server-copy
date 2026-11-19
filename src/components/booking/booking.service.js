const BookingDal = require('./booking.dal');
const Database = require('../../service/database');
const InquiryService = require('../inquiry/inquiry.service');
const RoomDal = require('../room/room.dal');
const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (pgId, id, data, inquiryId) => {
  const dbClient = await Database.pool.connect();
  try {
    if (data.roomId) {
      const room = await RoomDal.getRoomById(dbClient, pgId, data.roomId);

      if (!room) throw new ServerError('NOT_FOUND', 'Room not found');
    }
    const result = await BookingDal.create(dbClient, pgId, id, data);
    if (inquiryId) {
      await InquiryService.update(pgId, id, inquiryId, { status: 'booked' });
    }
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async (pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await BookingDal.list(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (pgId, bookingId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    if (data.roomId) {
      const room = await RoomDal.getRoomById(dbClient, pgId, data.roomId);

      if (!room) throw new ServerError('NOT_FOUND', 'Room not found');
    }
    await BookingDal.update(dbClient, pgId, bookingId, userId, data);
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region delete

exports.delete = async (pgId, userId, bookingId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await BookingDal.delete(dbClient, pgId, userId, bookingId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
