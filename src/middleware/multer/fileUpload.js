const multer = require('multer');
const storage = require('./storage');

const upload = multer({
  storage,
  limits: { fileSize: 10485760 }, // 10MB
});

module.exports = upload;
