const Dal = require('./room.dal');
const Database = require('../../service/database');
const ServerError = require('../../utility/serverError');
const Logger = require('../../lib/logger');
const GuestDal = require('../guest/guest.dal');

function calculateLightBillForGuest(
  guestArray,
  roomCurrentReading,
  roomPreviousReading,
  year,
  month,
) {
  let guests = guestArray;

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const startReading = 0;
  const endReading = roomCurrentReading - roomPreviousReading;

  // Filter guests based on check-in or check-out dates within the month
  guests = guests.filter((guest) => {
    const checkOutDate = guest.checkOutDate ? new Date(guest.checkOutDate) : monthEnd;
    return !(checkOutDate <= monthStart); // Ensures guest is valid for this period
  });

  // Map guests to adjust readings and check-in/check-out dates
  guests = guests.map((g) => {
    const guest = g;
    guest.unitContribution = 0;
    guest.checkInDate = new Date(guest.checkInDate);
    guest.checkOutDate = guest.checkOutDate ? new Date(guest.checkOutDate) : monthEnd;

    // Adjust check-in reading if check-in is before monthStart
    if (guest.checkInDate < monthStart) {
      guest.checkInReading = startReading;
      guest.checkInDate = monthStart;
    } else {
      guest.checkInReading -= roomPreviousReading;
    }

    // Adjust check-out reading and dates
    if (guest.checkOutDate > monthEnd) {
      guest.checkOutDate = monthEnd;
      guest.checkOutReading = endReading;
    } else if (guest.checkOutReading) {
      guest.checkOutReading -= roomPreviousReading;
    } else {
      guest.checkOutReading = endReading;
    }

    if (!guest.checkInReading) guest.checkInReading = roomPreviousReading;
    if (!guest.checkOutReading) guest.checkOutReading = roomCurrentReading;

    return guest;
  });

  const isInvalid = guests.find((guest) => {
    if (guest.checkInReading > guest.checkOutReading) return true;
    return false;
  });

  if (isInvalid) return [];

  const events = [];

  // Create check-in and check-out events
  guests.forEach((guest) => {
    if (guest.checkInDate >= monthStart) {
      events.push({
        date: guest.checkInDate,
        reading: guest.checkInReading,
        type: 'in',
        guest,
      });
    }

    if (guest.checkOutDate <= monthEnd) {
      events.push({
        date: guest.checkOutDate,
        reading: guest.checkOutReading,
        type: 'out',
        guest,
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => a.date - b.date);

  let currentReading = startReading;
  let lastReading = startReading;
  let guestsInRoom = [];

  // Process the events to calculate bill amounts
  events.forEach((event) => {
    if (event.type === 'in') {
      lastReading = currentReading;
      currentReading = event.reading;

      // Update bill amounts for guests in the room
      guestsInRoom.forEach((g) => {
        const guest = g;
        guest.unitContribution
          += (currentReading - lastReading) / guestsInRoom.length;
      });

      guestsInRoom.push({ id: event.guest.id, unitContribution: 0 });
    } else {
      lastReading = currentReading;
      currentReading = event.reading;

      // Update bill amounts for guests in the room
      guestsInRoom.forEach((g) => {
        const guest = g;
        guest.unitContribution += (currentReading - lastReading) / guestsInRoom.length;
      });

      // Find the guest in the room and assign the bill amount
      const guestInRoom = guestsInRoom.find((g) => g.id === event.guest.id);
      if (guestInRoom) {
        const guestIndex = guests.findIndex((g) => g.id === event.guest.id);
        if (guestIndex !== -1) {
          guests[guestIndex].unitContribution = guestInRoom.unitContribution;
        }
      }

      // Remove the guest from guestsInRoom after check-out
      guestsInRoom = guestsInRoom.filter((g) => g.id !== event.guest.id);
    }
  });

  return guests;
}

// #region create
exports.create = async (pgId, userId, data) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await Dal.create(dbClient, pgId, userId, data);
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
    const result = await Dal.list(dbClient, pgId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region getRoomById
exports.getRoomById = async (pgId, guestOrRoomId) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await Dal.getRoomById(dbClient, pgId, guestOrRoomId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region deleteRoomById
exports.deleteRoomById = async (pgId, roomId) => {
  const dbClient = await Database.pool.connect();

  try {
    const result = await Dal.getRoomById(dbClient, pgId, roomId);

    if (!result) throw new ServerError('RESOURCE_NOT_FOUND', 'Room not found');
    if (result.guests.length) throw new ServerError('NOT_IMPLEMENTED', 'Room is not empty');

    await Dal.deleteRoomById(dbClient, roomId);
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region updateRoomById
exports.updateRoomById = async (pgId, userId, roomId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await Dal.getRoomById(dbClient, pgId, roomId);
    if (!result) throw new ServerError('RESOURCE_NOT_FOUND');
    if (result.guests.length > data.capacity) {
      throw new ServerError(
        'INVALID_DATA',
        'Capacity is less than guests count',
      );
    }
    await Dal.updateRoomById(dbClient, userId, roomId, data);
  } finally {
    dbClient.release();
  }
};
// #endregion

// TODO : calculation can be improved
// #region calculateRoomLightBill
exports.calculateRoomLightBill = async (pgId, roomId) => {
  const dbClient = await Database.pool.connect();
  const roomMeta = {};

  try {
    // Fetch Room
    const Room = await Dal.getRoomDetailsForBillCalculation(dbClient, pgId, roomId);

    if (!Room.guests || !Room.roomLightBillHistory || Room.roomLightBillHistory.length !== 2) return Room;

    const roomCurrentMonthReading = Room.roomLightBillHistory[0].reading;
    const roomPreviousMonthReading = Room.roomLightBillHistory[1].reading;

    if (roomCurrentMonthReading <= roomPreviousMonthReading) {
      roomMeta.error = 'current month reading is less then previous month reading';
      return Room;
    }

    const readingDifference = roomCurrentMonthReading - roomPreviousMonthReading;
    const perGuestContribution = Number((readingDifference / (Room.guests?.length || 1)).toFixed(2));
    const perBedContribution = Number((readingDifference / Room.capacity).toFixed(2));

    Room.guests = calculateLightBillForGuest(
      Room.guests,
      roomCurrentMonthReading,
      roomPreviousMonthReading,
      Room.roomLightBillHistory[0].year,
      Room.roomLightBillHistory[0].month,
    );

    await Promise.all(
      Room.guests.map((guest) => GuestDal.update(dbClient, pgId, guest.id, {
        meta: {
          perBedUnitContribution: perBedContribution,
          perGuestUnitContribution: perGuestContribution,
          unitContribution: guest.unitContribution,
          unitPrice: Room.roomLightBillHistory[0].unitPrice,
          month: Room.roomLightBillHistory[0].month,
          year: Room.roomLightBillHistory[0].year,
        },
      })),
    );

    return Room;
  } catch (err) {
    Logger.error(err);
    return null;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region room data export

exports.exportRoomData = async (pgId) => {
  const dbClient = await Database.pool.connect();

  try {
    let data = await Dal.roomListExport(dbClient, pgId);
    const { currentMonth, previousMonth } = data.find((d) => d.currentMonth !== null && d.previousMonth !== null);

    const headers = [
      {
        name: 'Room Name',
        key: 'name',
      },
      {
        name: 'Rent',
        key: 'rent',
      },
      {
        name: 'Capacity',
        key: 'capacity',
      },
      {
        name: 'Occupied Beds',
        key: 'occupied',
      },
      {
        name: 'Vacant Beds',
        key: 'vacant',
      },
      {
        name: `Reading ${previousMonth}`,
        key: 'previousReading',
      },
      {
        name: `Reading ${currentMonth}`,
        key: 'currentReading',
      },
      {
        name: 'Consumption',
        key: 'consumption',
      },
      {
        name: 'Rate',
        key: 'unitPrice',
      },
      {
        name: 'Total Light Bill',
        key: 'bill',
      },
      {
        name: 'Per Bed Bill',
        key: 'billPerBed',
      },
      {
        name: 'Per Guest Bill',
        key: 'billPerGuest',
      },
      {
        name: 'Tags',
        key: 'tags',
      },
      {
        name: 'Info',
        key: 'info',
      },
    ];

    data = data.map((d) => {
      const consumption = d.currentReading - d.previousReading;
      const bill = Math.round(consumption * d.unitPrice);
      const vacant = d.capacity - d.occupied;
      const billPerBed = Math.round(bill / d.capacity);
      const billPerGuest = Math.round(bill / d.occupied);
      const tags = d.tags.join(',');

      const row = {
        ...d,
        vacant,
        consumption,
        bill,
        billPerBed,
        billPerGuest,
        tags,
      };

      delete row.currentMonth;
      delete row.previousMonth;

      return row;
    });

    return { headers, data };
  } finally {
    dbClient.release();
  }
};
