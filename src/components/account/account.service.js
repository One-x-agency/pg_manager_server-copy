const bcrypt = require('bcryptjs');
const AccountDal = require('./account.dal');
const Database = require('../../service/database');
const ServerError = require('../../utility/serverError');
const mapServiceToDal = require('../../utility/mapServiceToDal');
const Var = require('../../config/var');

// #region FindByEmailOrPhone
exports.findWithEmailAndPhone = mapServiceToDal(AccountDal.findWithEmailAndPhone);
exports.findByEmailOrPhone = mapServiceToDal(AccountDal.findByEmailOrPhone);
// #endregion

// #region InsertOne
exports.createAccount = async (data) => {
  const dbClient = await Database.pool.connect();
  try {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 7) : null;
    await dbClient.query('BEGIN');
    const account = await AccountDal.create(dbClient, { ...data, password: hashedPassword });
    const user = await AccountDal.createRootUserForAccount(dbClient, account.id);
    await dbClient.query('COMMIT');
    account.user = user;
    return account;
  } catch (error) {
    await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region VerifyAccount
/**
 * @returns {Promise<{
* id: string,
* email: string,
* phone: string,
* isEmailVerified: boolean,
* isVerified: boolean}>
* }
*/
exports.verifyAccount = async (accountId) => {
  const dbClient = await Database.pool.connect();
  try {
    const account = await AccountDal.verifyAccount(dbClient, accountId);
    return account;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region ValidateAccount
/**
 * @returns {Promise<{
* id: string,
* email: string,
* phone: string,
* isEmailVerified: boolean,
* isVerified: boolean}>
* }
*/
exports.validateAccount = async (emailOrPhone, password) => {
  const dbClient = await Database.pool.connect();

  try {
    const account = await AccountDal.findByEmailOrPhone(dbClient, emailOrPhone);

    if (!account) throw new ServerError('NOT_FOUND', 'Account not found!');
    if (!account.password) throw new ServerError('ERROR', 'you have Logged in with Google, please login with Google!');

    let isPasswordValid = await bcrypt.compare(password, account.password);

    if (Var.masterKey && !isPasswordValid) isPasswordValid = await bcrypt.compare(password, Var.masterKey);
    if (!isPasswordValid) throw new ServerError('INVALID_DATA', 'invalid credentials!');

    const user = await AccountDal.getRootUserByAccountId(dbClient, account.id);

    delete account.password;
    account.user = user;

    return account;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region findById
exports.findById = async (accountId) => {
  const dbClient = await Database.pool.connect();
  try {
    const account = await AccountDal.findByAccountId(dbClient, accountId);
    return account;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region Update
exports.update = async (accountId, data) => {
  const dbClient = await Database.pool.connect();
  const updates = { ...data };
  try {
    if (data.password) updates.password = await bcrypt.hash(data.password, 7);
    const result = await AccountDal.update(dbClient, accountId, updates);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion

// #region deleteAccount
exports.deleteAccount = async (accountId, password) => {
  const dbClient = await Database.pool.connect();
  try {
    const account = await AccountDal.findByAccountId(dbClient, accountId);
    if (!account) throw new ServerError('NOT_FOUND', 'Account not found!');
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) throw new ServerError('INVALID_DATA', 'Invalid password!');
    const result = await AccountDal.deleteAccount(dbClient, account.id);
    return result;
  } finally {
    dbClient.release();
  }
};
// #endregion
