const UserService = require('./user.service');
const Constants = require('../../config/constant');
const User = require('./user.class');
const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (req, res, next) => {
  const { accountId } = req.user;
  const data = req.body;
  try {
    const result = await UserService.create(accountId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region list
exports.list = async (req, res, next) => {
  const { accountId } = req.user;
  const { pgId } = req.query;

  if (pgId && !await req.user.hasAccessToPg(pgId)) throw new ServerError('UNAUTHORIZED', 'You do not have access to this PG');

  try {
    const result = await UserService.list(accountId, pgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region login
exports.login = async (req, res, next) => {
  try {
    const user = await UserService.login(req.body, req.params.accountNumber);

    let { expiryInSeconds } = Constants.user.token;
    if (req.body.longLived) expiryInSeconds = 3600 * 24 * 30;

    const payload = {
      accountId: user.accountId,
      id: user.id,
      isRootUser: false,
    };

    const UserClass = new User(payload);

    const token = UserClass.generateToken({ expiryInSeconds });

    res.cookie('token', token, { maxAge: expiryInSeconds * 1000, httpOnly: true });

    const responseData = {
      token,
      user: {
        ...payload,
        username: user.username,
        phone: user.phone,
        accountNumber: user.accountNumber,
      },
      expiryInSeconds,
    };
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region update
exports.update = async (req, res, next) => {
  const { accountId } = req.user;
  const { userId } = req.params;
  const data = req.body;
  try {
    const result = await UserService.update(accountId, userId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region delete
exports.delete = async (req, res, next) => {
  const { accountId } = req.user;
  const { userId } = req.params;
  try {
    await UserService.delete(userId, accountId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region allocatePg
exports.updateUserPermission = async (req, res, next) => {
  const { accountId } = req.user;
  const { userId } = req.params;
  const { pgId, permission } = req.body;
  try {
    const result = await UserService.updatePermission(accountId, userId, pgId, permission);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region deletePermission
exports.deletePermission = async (req, res, next) => {
  const { accountId } = req.user;
  const { userId } = req.params;
  const { pgId } = req.body;
  try {
    await UserService.deletePermission(accountId, userId, pgId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region fetchUserPermissionsForPg
exports.fetchUserPermissionsForPg = async (req, res, next) => {
  const { pgId } = req.query;
  try {
    const result = await req.user.fetchUserPermissionsForPg(pgId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region getUserById
exports.getUserById = async (req, res, next) => {
  const { accountId } = req.user;
  const { userId } = req.params;
  try {
    const result = await UserService.getUserById(accountId, userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
// #endregion
