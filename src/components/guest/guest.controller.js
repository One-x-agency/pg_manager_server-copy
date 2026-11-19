const jwt = require('jsonwebtoken');
const GuestService = require('./guest.service');
const ServerError = require('../../utility/serverError');
const WhatsApp = require('../../service/whatsApp');
const TokenService = require('../token/token.service');
const Vars = require('../../config/var');
const InquiryService = require('../inquiry/inquiry.service');
const BookingService = require('../booking/booking.service');
const QB = require('../../lib/queryBuilder');
const FileStorageService = require('@/service/fileStorage');

// #region Create
exports.create = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    const { id: userId } = req.user;
    const { redirectUrl } = req.body;
    const result = await GuestService.create(pgId, userId, req.body);

    const profileToken = jwt.sign(
      {
        type: 'access',
        pgId,
        guestId: result.id,
      },
      Vars.jwtSecret,
      { expiresIn: 120000 },
    );

    const redirectUrlWithToken = `${redirectUrl}?token=${profileToken}`;

    if (req.query.inquiryId) InquiryService.update(pgId, userId, req.query.inquiryId, { status: 'converted' });
    if (req.query.bookingId) BookingService.delete(pgId, userId, req.query.bookingId);

    WhatsApp.updateGuestProfile({
      phone: result.phone,
      guestName: result.name,
      pgName: result.pg.name,
      link: redirectUrlWithToken,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region List
exports.list = async (req, res, next) => {
  try {
    const { pgId } = req.params;

    const result = await GuestService.list(pgId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region getGuestById
exports.getGuestById = async (req, res, next) => {
  try {
    const { guestId, pgId } = req.params;
    const result = await GuestService.getGuestById(pgId, guestId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region verifyNumber
exports.verifyNumber = async (req, res, next) => {
  try {
    const { pgCode, phone } = req.body;

    const guest = await GuestService.findGuestByPhoneNumberAndPgCode(pgCode, phone);
    if (!guest) throw new ServerError('NOT_FOUND', 'Guest not found');

    if (guest.isPhoneVerified) {
      res.status(200).json({ isPhoneVerified: true });
      return;
    }

    const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 20);

    const token = jwt.sign({ guestId: guest.id }, Vars.jwtSecret, { expiresIn: '20m' });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await TokenService.insertOne({ token, userId: guest.id, expireAt: expiryDate.toISOString(), otp });

    await WhatsApp.sendOtp({
      phone: guest.phone,
      OTP: otp,
    });

    res.status(200).json({ isPhoneVerified: false, token });
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { guestId, pgId } = req.params;
    const data = req.body;

    data.updatedBy = id;
    data.updatedAt = new Date();

    await GuestService.update(pgId, guestId, data);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region Delete
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { guestId, pgId } = req.params;
    await GuestService.delete(pgId, id, guestId);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region UploadDocument
exports.uploadDocument = async (req, res, next) => {
  try {
    const { guestId, pgId } = req.params;
    const { file } = req;
    const { name } = req.body;

    if (!file) throw new ServerError('INVALID_DATA', 'File not found');

    const imageFileName = FileStorageService.saveFile(file.filename);

    const result = await GuestService.uploadDocument(pgId, guestId, { name, image: imageFileName });
    result.image = FileStorageService.generateUrl(imageFileName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region DeleteDocument
exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentId, pgId } = req.params;
    const result = await GuestService.deleteDocument(pgId, documentId);
    if (!result) throw new ServerError('NOT_FOUND', 'Document not found');
    FileStorageService.delete(result.image);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region UpdateProfileImage
exports.updateProfileImage = async (req, res, next) => {
  try {
    const { guestId, pgId } = req.params;
    const { file } = req;

    if (!file) throw new ServerError('INVALID_DATA', 'File not found');

    const guest = await QB.QueryOne(`
        Select "id", "profileImage" from "Guests"
        where "id" = $1 and "pgId" = $2;
      `, guestId, pgId);

    if (!guest) throw new ServerError('NOT_FOUND', 'Guest not found');

    const imageFileName = FileStorageService.saveFile(file.filename);

    const newData = {
      profileImage: imageFileName,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    };

    const result = await GuestService.update(pgId, guestId, newData);
    result.profileImage = FileStorageService.generateUrl(imageFileName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region removeProfileImage
exports.removeProfileImage = async (req, res, next) => {
  const { guestId, pgId } = req.params;
  try {
    const guest = await QB.QueryOne(`
      Select "id", "profileImage" from "Guests"
      where "id" = $1 and "pgId" = $2;
    `, guestId, pgId);

    if (!guest) throw new ServerError('NOT_FOUND', 'Guest not found');

    const newData = {
      profileImage: null,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    };
    await GuestService.update(pgId, guestId, newData);
    if (guest.profileImage) FileStorageService.delete(guest.profileImage);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region exportData

exports.exportData = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    const { month, year } = req.query;
    const result = await GuestService.exportData(pgId, month, year);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
