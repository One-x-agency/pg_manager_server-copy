/* eslint-disable consistent-return */

const User = require('../components/user/user.class');
const Token = require('../utility/jwtToken');

// const vars = require('../config/var');

/**
 * Parse user from token
 * - If token is valid, user will be added to req object
 */
const decodeToken = async (req, res, next) => {
  const token = req.headers.authorization || req.cookies.token;
  if (!token) return next();

  const payload = Token.decode(token) || {};

  req.user = new User(payload);
  req.user.token = token;
  req.user.payload = payload;

  if (!payload) req.user.isTokenInvalid = true;

  next();
};

module.exports = decodeToken;
