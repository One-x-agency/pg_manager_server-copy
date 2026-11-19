const ServerError = require('../../utility/serverError');

const isLoggedIn = (req, res, next) => {
  if (req.user && !req.user.token) throw new ServerError('UNAUTHORIZED', 'token is required');
  if (!req.user || !req.user.id) throw new ServerError('UNAUTHORIZED', 'user is not logged.');
  next();
};

module.exports = isLoggedIn;
