const jwt = require('jsonwebtoken');
const Vars = require('../../config/var');
const Constants = require('../../config/constant');
const Database = require('../../service/database');
const UserDal = require('./user.dal');

class User {
  constructor({ id, isRootUser, accountId }) {
    this.id = id;
    this.accountId = accountId;
    this.isRootUser = isRootUser;
    this._pgs = [];
    this._pgs_fetched = false;
  }
}

User.prototype.fetchPgAccess = async function fetchPgAccess() {
  const dbClient = await Database.pool.connect();
  try {
    this._pgs = await UserDal.fetchUserPgAccessForUser(dbClient, this.id, this.isRootUser);
    this._pgs_fetched = true;
  } finally {
    dbClient.release();
  }
};

User.prototype.hasAccessToPg = async function hasAccessToPg(pgId) {
  if (!this._pgs_fetched) await this.fetchPgAccess();
  return this._pgs.some((pg) => pg.id === pgId);
};

User.prototype.generateToken = function generateToken({ expiryInSeconds = Constants.user.token.expiryInSeconds } = {}) {
  const payload = {
    type: 'user',
    id: this.id,
    accountId: this.accountId,
    isRootUser: this.isRootUser,
  };

  return jwt.sign(
    payload,
    Vars.jwtSecret,
    { expiresIn: expiryInSeconds },
  );
};

User.prototype.fetchUserPermissionsForPg = async function fetchUserPermissionsForPg(pgId) {
  if (this.isRootUser) return Constants.modules.rootPermissions;
  if (!this._pgs_fetched) await this.fetchPgAccess();
  const pg = this._pgs.find((p) => p.id === pgId);
  if (!pg) return null;
  return pg.meta || {};
};

module.exports = User;
