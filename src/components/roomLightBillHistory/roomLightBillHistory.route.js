const express = require('express');
const LightBillController = require('./roomLightBillHistory.controller');
const LightBillValidation = require('./roomLightBillHistory.validation');
const { validate } = require('../../utility/validationHelper');
const { upload } = require('../../middleware/multer/singleFileUpload');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.update'),
    upload.single('file'),
    validate(LightBillValidation.create),
    LightBillController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.read'),
    validate(LightBillValidation.list),
    LightBillController.list,
  );

router.route('/:roomLightBillId')
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.update'),
    upload.single('file'),
    validate(LightBillValidation.update),
    LightBillController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('room.update'),
    validate(LightBillValidation.delete),
    LightBillController.delete,
  );

module.exports = router;
