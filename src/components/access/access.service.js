const Database = require('../../service/database');
const GuestDal = require('../guest/guest.dal');
const AccessDal = require('./access.dal');

exports.getGuestById = async (pgId, guestId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await AccessDal.getGuestById(dbClient, pgId, guestId);
    return result;
  } finally {
    dbClient.release();
  }
};

exports.updateGuestProfile = async (pgId, guestId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await GuestDal.update(dbClient, pgId, guestId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
