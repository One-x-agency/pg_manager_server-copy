const Database = require('../../service/database');
const GuestDal = require('./guest.dal');
const RoomDal = require('../room/room.dal');
const BookingDal = require('../booking/booking.dal');
const ServerError = require('../../utility/serverError');

// #region Create
exports.create = async (pgId, userId, data) => {
  const dbClient = await Database.getConnection();
  try {
    const guest = await dbClient.queryOne('SELECT * FROM guest WHERE phone = $1 AND "pgId" = $2', { phone: data.phone, pgId });
    if (guest) throw new ServerError('RESOURCE_ALREADY_EXISTS', 'Guest already exists');

    const room = await dbClient.queryOne(
      `
          SELECT
            r.capacity as "capacity",
            COUNT(g."id") AS "occupied"
          FROM room r
          JOIN pg p ON r."pgId" = p."id"
          LEFT JOIN guest g ON r."id" = g."roomId"
          WHERE r."id" = $roomId AND p."id" = $pgId
          GROUP BY r."id", p."id"
        `,
      { roomId: data.roomId, pgId },
    );
    if (!room) throw new ServerError('NOT_FOUND', 'Room not found');
    if (room.occupied >= room.capacity) throw new ServerError('UNPROCESSABLE', 'Room is full');

    const newGuest = await GuestDal.create(dbClient, pgId, userId, data);

    return newGuest;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region List
exports.list = async (pgId, query) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.list(dbClient, pgId, query);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region getGuestById
exports.getGuestById = async (pgId, guestId) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.getGuestById(dbClient, pgId, guestId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region findGuestByPhoneNumberAndPgCode
exports.findGuestByPhoneNumberAndPgCode = async (pgCode, phone) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.findGuestByPhoneNumberAndPgCode(dbClient, pgCode, phone);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (pgId, guestId, data) => {
  const dbClient = await Database.getConnection();
  let meta = {};
  try {
    const guest = await GuestDal.getGuestById(dbClient, pgId, guestId);
    meta = guest?.meta;

    if (data.roomId) {
      const room = await RoomDal.getRoomById(dbClient, pgId, data.roomId);

      if (!room) throw new ServerError('NOT_FOUND', 'Room not found');

      const isRoomFull = room.guests.length >= room.capacity;
      const isGuestInRoom = room.guests.map((obj) => obj.id).includes(guestId);

      if (!isGuestInRoom && isRoomFull) {
        throw new ServerError('UNPROCESSABLE', 'Room is full');
      }

      if (guest.room.id !== data.roomId) {
        meta.room = {
          previousRoomId: guest.room.id,
          previousRoomName: guest.room.name,
          changedAt: new Date().toISOString(),
        };
      }
    }

    if (data.rent && data.rent !== guest.rent) {
      meta.rent = {
        previousRent: guest.rent,
        changedAt: new Date().toISOString(),
      };
    }

    const result = await GuestDal.update(dbClient, pgId, guestId, { ...data, meta });
    return result;
  } finally {
    dbClient.release();
  }
};

// #endregion

// #region delete
exports.delete = async (pgId, userId, guestId) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.delete(dbClient, pgId, userId, guestId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region UploadDocument
exports.uploadDocument = async (pgId, guestId, data) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.uploadDocument(dbClient, pgId, guestId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region DeleteDocument
exports.deleteDocument = async (pgId, documentId) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.deleteDocument(dbClient, pgId, documentId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region exportData

exports.exportData = async (pgId, month, year) => {
  const dbClient = await Database.getConnection();
  try {
    const result = await GuestDal.exportData(dbClient, pgId, month, year);
    const bookingRowData = await BookingDal.exportData(dbClient, pgId, month, year);

    const headers = [
      { name: 'Room Name', key: 'roomName' },
      { name: 'Name', key: 'name' },
      { name: 'Mobile No', key: 'phone' },
      { name: 'Particular', key: 'particular' },
      { name: 'Date Of Notice', key: 'dateOfNotice' },
      { name: 'Date Of Joining', key: 'checkOutDate' },
      { name: 'Date Of Leave', key: 'checkInDate' },
      { name: 'Deposit', key: 'deposit' },
      { name: 'Rent Per Month', key: 'rent' },
      { name: 'previousRoomName', key: 'previousRoomName' },
      { name: 'previousRent', key: 'previousRent' },
    ];

    const guestData = result.map((item) => {
      const obj = { ...item };

      if (obj.dateOfNotice || obj.checkInDate || obj.checkOutDate) {
        obj.dateOfNotice = obj.dateOfNotice ? new Date(obj.dateOfNotice).toLocaleDateString() : null;
        obj.checkInDate = obj.checkInDate ? new Date(obj.checkInDate).toLocaleDateString() : null;
        obj.checkOutDate = obj.checkOutDate ? new Date(obj.checkOutDate).toLocaleDateString() : null;
      }

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      if (obj.checkInDate) {
        const checkInDate = obj.checkInDate ? new Date(obj.checkInDate) : null;
        const checkOutDate = obj.checkOutDate ? new Date(obj.checkOutDate) : null;
        const dateOfNotice = obj.dateOfNotice ? new Date(obj.dateOfNotice) : null;

        if (checkInDate.getMonth() === currentMonth && checkInDate.getFullYear() === currentYear
            && !dateOfNotice && !checkOutDate) {
          obj.particular = 'JOIN';
        }

        if (checkOutDate && checkOutDate < today && checkOutDate.getMonth() === currentMonth
            && checkInDate.getMonth() !== currentMonth) {
          obj.particular = 'LEAVED';
        }

        if (dateOfNotice && dateOfNotice.getMonth() === currentMonth && dateOfNotice.getFullYear() === currentYear
            && checkInDate.getMonth() === currentMonth && checkInDate.getFullYear() === currentYear) {
          obj.particular = 'JOIN/NOTICED';
        }

        if (dateOfNotice && dateOfNotice.getMonth() === currentMonth && dateOfNotice.getFullYear() === currentYear
            && (checkInDate.getMonth() !== currentMonth || (checkOutDate && checkOutDate.getMonth() !== currentMonth))) {
          obj.particular = 'CONTINUE';
        }

        if ((!dateOfNotice && !checkOutDate) && (checkInDate.getMonth() !== currentMonth || (checkOutDate && checkOutDate.getMonth() !== currentMonth))) {
          obj.particular = 'CONTINUE';
        }

        if (dateOfNotice && dateOfNotice.getMonth() === currentMonth && dateOfNotice.getFullYear() === currentYear
            && (checkInDate.getMonth() !== currentMonth || (checkOutDate && checkOutDate > today))) {
          obj.particular = 'NOTICED';
        }
        if (!obj.particular) {
          obj.particular = 'CONTINUE';
        }
      }

      if (obj.previousRoomName) {
        obj.particular = 'SHIFTED';
      }

      if (obj.previousRent) {
        obj.particular = 'RENT CHANGE';
      }

      return obj;
    });
    const bookingDate = bookingRowData.map((item) => {
      const obj = { ...item };
      obj.particular = 'BOOKED';
      obj.checkInDate = obj.checkInDate ? new Date(obj.checkInDate).toLocaleDateString() : null;
      obj.checkOutDate = obj.checkOutDate ? new Date(obj.checkOutDate).toLocaleDateString() : null;
      obj.dateOfNotice = obj.dateOfNotice ? new Date(obj.dateOfNotice).toLocaleDateString() : null;
      obj.previousRoomName = null;
      obj.previousRent = null;
      return obj;
    });
    return { data: [...guestData, ...bookingDate], headers };
  } finally {
    dbClient.release();
  }
};

// #endregion
