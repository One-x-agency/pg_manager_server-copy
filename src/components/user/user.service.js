const bycrypt = require('bcryptjs');
const UserDal = require('./user.dal');
const Database = require('../../service/database');
const ServerError = require('../../utility/serverError');

// #region create
exports.create = async (accountId, data) => {
  const { pgId, permission } = data;
  const dbClient = await Database.pool.connect();

  let needTransaction = false;
  if (pgId && permission) needTransaction = true;
  let userPgAccess = {};

  try {
    const hashedPassword = await bycrypt.hash(data.password, 10);

    if (needTransaction) await dbClient.query('BEGIN');

    const newUser = await UserDal.create(dbClient, accountId, { ...data, password: hashedPassword });

    if (pgId && permission) userPgAccess = await UserDal.upsertUserPgAccess(dbClient, newUser.id, pgId, permission);

    if (needTransaction) await dbClient.query('COMMIT');

    return { ...newUser, ...userPgAccess };
  } catch (error) {
    if (needTransaction) await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region list
exports.list = async (accountId, pgId) => {
  const dbClient = await Database.pool.connect();
  try {
    if (pgId) return await UserDal.listUserByAccountAndPgId(dbClient, accountId, pgId);
    return await UserDal.listUserByAccountId(dbClient, accountId);
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region login
exports.login = async (data, accountId) => {
  const dbClient = await Database.pool.connect();
  const { usernameOrPhone, password } = data;
  let user;

  try {
    user = await UserDal.getUserByUsernameOrPhoneAndAccountId(dbClient, usernameOrPhone, accountId);
  } finally {
    dbClient.release();
  }

  if (!user) throw new ServerError('NOT_FOUND', 'User not found!');

  const isPasswordMatch = await bycrypt.compare(password, user.password);

  if (!isPasswordMatch) throw new ServerError('INVALID_DATA', 'Invalid username or password!');

  delete user.password;

  return user;
};
// #endregion

// #region Update
exports.update = async (accountId, userId, data) => {
  const dbClient = await Database.pool.connect();
  try {
    let hashedPassword;
    if (data.password) hashedPassword = await bycrypt.hash(data.password, 10);
    const result = await UserDal.update(dbClient, accountId, userId, { ...data, password: hashedPassword });
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region Delete
exports.delete = async (userId, accountId) => {
  const dbClient = await Database.pool.connect();
  try {
    await dbClient.query('BEGIN');
    const result = await UserDal.delete(dbClient, userId, accountId);
    await UserDal.deallocateAllPgs(dbClient, result.id);
    await dbClient.query('COMMIT');
    return result;
  } catch (error) {
    await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region allocatePg
exports.updatePermission = async (accountId, userId, pgId, permission) => {
  const dbClient = await Database.pool.connect();

  try {
    const [user, pgList] = await Promise.all([
      UserDal.getUserById(dbClient, accountId, userId),
      UserDal.listPgByAccountId(dbClient, accountId).then((pgl) => pgl.map((pg) => pg.id)), // TODO : can be optimized
    ]);

    if (!user) throw new ServerError('NOT_FOUND', `user ${userId} not found`);
    if (!pgList.includes(pgId)) throw new ServerError('PERMISSION_DENIED', `you don't have access to pg ${pgId}`);

    const result = await UserDal.upsertUserPgAccess(dbClient, userId, pgId, permission);

    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region deletePermission
exports.deletePermission = async (accountId, userId, pgId) => {
  const dbClient = await Database.pool.connect();

  try {
    const [user, pgList] = await Promise.all([
      UserDal.getUserById(dbClient, accountId, userId),
      UserDal.listPgByAccountId(dbClient, accountId).then((pgl) => pgl.map((pg) => pg.id)), // TODO : can be optimized
    ]);

    if (!user) throw new ServerError('NOT_FOUND', `user ${userId} not found`);
    if (!pgList.includes(pgId)) throw new ServerError('PERMISSION_DENIED', `you don't have access to pg ${pgId}`);

    const result = await UserDal.deallocatePg(dbClient, userId, pgId);

    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region getUserById
exports.getUserById = async (accountId, userId) => {
  const dbClient = await Database.pool.connect();
  try {
    return await UserDal.getUserById(dbClient, accountId, userId);
  } finally {
    dbClient.release();
  }
};
// #endregion
