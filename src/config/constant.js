const fs = require('fs');
const path = require('path');
const errorCodes = require('./errorCode');

const fileStoragePath = path.join(__dirname, '../../files');
const tmpStoragePath = path.join(__dirname, '../../tmp');

if (!fs.existsSync(fileStoragePath)) fs.mkdirSync(fileStoragePath);
if (!fs.existsSync(tmpStoragePath)) fs.mkdirSync(tmpStoragePath);

module.exports = {

  fileStoragePath,
  tmpStoragePath,

  modules: {
    rootPermissions: {
      guest: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
      room: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
      inquiry: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
      staff: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
      expense: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
      booking: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
    },
  },

  user: {
    token: {
      expiryInSeconds: 86400,
    },
  },

  pg: {
    type: ['boys', 'girls', 'both'],
  },

  room: {
    tags: [
      'AC',
      'TV',
      'Fridge',
      'Balcony',
      'Attached Bathroom',
      'wifi',
    ],
  },

  guest: {
    gender: ['male', 'female'],
  },

  inquiry: {
    status: [
      'pending',
      'complete',
      'visited',
      'converted',
      'cancelled',
    ],
  },

  monthlyPayment: {
    type: ['cash', 'bank'],
  },
  errorCodes,

};
