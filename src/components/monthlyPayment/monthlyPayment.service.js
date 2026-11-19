const MonthlyPaymentDal = require('./monthlyPayment.dal');
const Database = require('../../service/database');

// #region create
exports.create = async (pgId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.create(dbClient, pgId, userId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region listByGuestId
exports.listByGuestId = async (pgId, query) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.listByGuestId(dbClient, pgId, query);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region update
exports.update = async (pgId, userId, monthlyPaymentId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.update(dbClient, pgId, userId, monthlyPaymentId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region delete
exports.delete = async (pgId, userId, monthlyPaymentId) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.delete(dbClient, pgId, userId, monthlyPaymentId);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region upsert
exports.upsert = async (pgId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.upsert(dbClient, pgId, userId, data);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region exportData
exports.exportData = async (pgId, month, year) => {
  const dbClient = await Database.pool.connect();
  try {
    const result = await MonthlyPaymentDal.exportData(dbClient, pgId, month, year);
    const headers = [
      { name: 'Room No', key: 'roomName' },
      { name: 'Guest Name', key: 'name' },
      { name: 'Mobile', key: 'number' },
      { name: 'Date Of Joining', key: 'checkInDate' },
      { name: 'Date Of Leaving', key: 'checkOutDate' },
      { name: 'Rent', key: 'rent' },
      { name: 'Light Bill', key: 'lightBill' },
      { name: 'Cash', key: 'cash' },
      { name: 'Bank', key: 'bank' },
      { name: 'Total', key: 'total' },
      { name: 'Deposit', key: 'deposit' },
      { name: 'Particular', key: 'particular' },

    ];
    const newData = result.map((item) => {
      const obj = { ...item };
      obj.cash = 0;
      obj.bank = 0;

      if (obj.checkInDate || obj.checkOutDate) {
        obj.checkInDate = obj.checkInDate ? new Date(obj.checkInDate).toLocaleDateString() : null;
        obj.checkOutDate = obj.checkOutDate ? new Date(obj.checkOutDate).toLocaleDateString() : null;
      }

      const checkInDate = obj.checkInDate ? new Date(obj.checkInDate) : null;
      const checkOutDate = obj.checkOutDate ? new Date(obj.checkOutDate) : null;
      const today = new Date().toISOString();

      if (checkInDate && checkInDate.getMonth() === month && checkInDate.getFullYear() === year) {
        obj.particular = 'JOIN';
      } else if (checkOutDate && checkOutDate < today) {
        obj.particular = 'LEAVED';
      } else {
        obj.particular = 'REGULAR';
      }

      if (obj.rentPaymentMethod === 'cash') {
        obj.cash += obj.rent;
      }
      if (obj.rentPaymentMethod === 'bank') {
        obj.bank += obj.rent;
      }
      if (obj.lightBillPaymentMethod === 'cash') {
        obj.cash += obj.lightBill;
      }
      if (obj.lightBillPaymentMethod === 'bank') {
        obj.bank += obj.lightBill;
      }

      obj.total = obj.rent + obj.lightBill;

      delete obj.rentPaymentMethod;
      delete obj.lightBillPaymentMethod;

      return obj;
    });

    return { data: newData, headers };
  } finally {
    dbClient.release();
  }
};
