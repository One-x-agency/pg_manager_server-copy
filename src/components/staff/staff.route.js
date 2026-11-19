const express = require('express');
const StaffController = require('./staff.controller');
const StaffValidation = require('./staff.validation');
const { validate } = require('../../utility/validationHelper');
const { upload } = require('../../middleware/multer/singleFileUpload');
const { hasPermission, privateRoute, hasAccessToPg } = require('../../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.read'),
    StaffController.list,
  )
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.create'),
    validate(StaffValidation.create),
    StaffController.create,
  );

router
  .route('/document/:documentId')
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.delete'),
    validate(StaffValidation.deleteDocument),
    StaffController.deleteDocument,
  );

router
  .route('/:staffId')
  .get(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.read'),
    validate(StaffValidation.getStaffById),
    StaffController.getStaffById,
  )
  .put(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.update'),
    validate(StaffValidation.update),
    StaffController.update,
  )
  .delete(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.delete'),
    validate(StaffValidation.delete),
    StaffController.delete,
  );

router
  .route('/:staffId/document')
  .post(
    privateRoute,
    hasAccessToPg,
    hasPermission('staff.create'),
    upload.single('file'),
    validate(StaffValidation.uploadDocument),
    StaffController.uploadDocument,
  );

module.exports = router;
