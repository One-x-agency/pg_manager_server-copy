const express = require('express');
const { upload } = require('../../middleware/multer/singleFileUpload');
const AccessController = require('./access.controller');
const { validate } = require('../../utility/validationHelper');
const AccessValidation = require('./access.validation');

const router = express.Router();

router.route('/guest')
  .get(validate(AccessValidation.getInfo), AccessController.getGuestById)
  .put(validate(AccessValidation.update), AccessController.update);

router.route('/guest/profile-image')
  .post(upload.single('file'), validate(AccessValidation.uploadProfile), AccessController.uploadProfile);

router.route('/guest/document')
  .post(upload.single('file'), validate(AccessValidation.uploadDocument), AccessController.uploadDocument);

router.route('/guest/document/:documentId')
  .delete(validate(AccessValidation.deleteDocument), AccessController.deleteDocument);

module.exports = router;
