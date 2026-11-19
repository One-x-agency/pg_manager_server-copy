const express = require('express');
const Joi = require('joi');
const accountRoutes = require('./account/account.route');
const pgRoutes = require('./pg/pg.route');
const roomRoutes = require('./room/room.route');
const guestRoutes = require('./guest/guest.route');
const userRoutes = require('./user/user.route');
const monthlyPaymentRoutes = require('./monthlyPayment/monthlyPayment.route');
const countryRoutes = require('./country/country.route');
const stateRoutes = require('./state/state.route');
const cityRoutes = require('./city/city.route');
const inquiryRoutes = require('./inquiry/inquiry.route');
const roomLightBillHistoryRoute = require('./roomLightBillHistory/roomLightBillHistory.route');
const reminderRoutes = require('./reminder/reminder.route');
const staffRoutes = require('./staff/staff.route');
const ValidationSchema = require('../config/validationSchema');
const AccessRoutes = require('./access/access.route');
const ExpenseRoutes = require('./expense/expense.route');
const BookingRoutes = require('./booking/booking.route');
const { validate } = require('../utility/validationHelper');

const pgIdValidation = {
  params: Joi.object({
    pgId: ValidationSchema.uuid.required(),
  }),
};

const pgRouter = express.Router({ mergeParams: true });

pgRouter.use('/room', roomRoutes);
pgRouter.use('/guest', guestRoutes);
pgRouter.use('/monthly-payment', monthlyPaymentRoutes);
pgRouter.use('/inquiry', inquiryRoutes);
pgRouter.use('/room-light-bill-history', roomLightBillHistoryRoute);
pgRouter.use('/reminder', reminderRoutes);
pgRouter.use('/staff', staffRoutes);
pgRouter.use('/expense', ExpenseRoutes);
pgRouter.use('/booking', BookingRoutes);

const router = express.Router();

router.use('/account', accountRoutes);
router.use('/user', userRoutes);
router.use('/country', countryRoutes);
router.use('/state', stateRoutes);
router.use('/city', cityRoutes);
router.use('/pg', pgRoutes);
router.use('/access', AccessRoutes);
router.use('/pg/:pgId', validate(pgIdValidation), pgRouter);

module.exports = router;
