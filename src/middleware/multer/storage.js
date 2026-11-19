const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const constants = require('@/config/constant');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, constants.tmpStoragePath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase().slice(1);
    const UUID = uuidv4();
    cb(null, `${UUID}.${extension}`);
  },
});

module.exports = storage;
