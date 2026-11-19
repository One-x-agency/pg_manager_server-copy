const express = require('express');
const { validate } = require('../../utility/validationHelper');
const FilterRoute = require('./filter/filter.route');

const GuestController = require('./guest.controller');
const GuestValidation = require('./guest.validation');
const { upload } = require('../../middleware/multer/singleFileUpload');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use('/filter', FilterRoute);

router.route('/')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.create'),
    validate(GuestValidation.create),
    GuestController.create,
  )
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.read'),
    validate(GuestValidation.list),
    GuestController.list,
  );

router.route('/verify-number')
  .post(
    privateRoute,
    hasAccessToPg,
    validate(GuestValidation.verifyNumber),
    GuestController.verifyNumber,
  );

router.route('/export-data').get(
  privateRoute,
  hasAccessToPg,
  hasPermission('guest.read'),
  validate(GuestValidation.exportData),
  GuestController.exportData,
);

router.route('/document/:documentId')
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(GuestValidation.deleteDocument),
    GuestController.deleteDocument,
  );

router.route('/:guestId')
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.read'),
    validate(GuestValidation.getGuestById),
    GuestController.getGuestById,
  )
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(GuestValidation.update),
    GuestController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.delete'),
    validate(GuestValidation.delete),
    GuestController.delete,
  );

router.route('/:guestId/document')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    upload.single('file'),
    validate(GuestValidation.uploadDocument),
    GuestController.uploadDocument,
  );

router.route('/:guestId/profile-image')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(GuestValidation.updateOrDeleteProfile),
    upload.single('file'),
    GuestController.updateProfileImage,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('guest.update'),
    validate(GuestValidation.updateOrDeleteProfile),
    GuestController.removeProfileImage,
  );

module.exports = router;
