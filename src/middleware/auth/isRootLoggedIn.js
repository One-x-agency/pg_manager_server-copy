const ServerError = require('../../utility/serverError');

const isRootLoggedIn = (req, res, next) => {
  if (!req.user || !req.user.accountId || !req.user.isRootUser) throw new ServerError('UNAUTHORIZED');
  next();
};

module.exports = isRootLoggedIn;
