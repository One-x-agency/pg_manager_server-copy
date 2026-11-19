const bcrypt = require('bcryptjs');
const PgService = require('./pg.service');
const AccountService = require('../account/account.service');
const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (req, res, next) => {
  try {
    const result = await PgService.create(req.user.accountId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  try {
    const result = await PgService.list(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region verifyCode
exports.verifyCode = async (req, res, next) => {
  try {
    await PgService.checkCodeValidity(req.params.code);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region findByPgId
exports.findByPgId = async (req, res, next) => {
  try {
    const result = await PgService.findByPgId(req.params.pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// #region update
exports.update = async (req, res, next) => {
  try {
    await PgService.update(req.params.pgId, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region delete
exports.delete = async (req, res, next) => {
  const { password } = req.body;
  try {
    const account = await AccountService.findById(req.user.accountId);
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) throw new ServerError('INVALID_DATA', 'Password is incorrect');
    await PgService.softDelete(req.params.pgId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion
