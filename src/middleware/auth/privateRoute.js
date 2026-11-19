/* eslint-disable consistent-return */

const User = require('../../components/user/user.class');
const Token = require('../../utility/jwtToken');
const ServerError = require('../../utility/serverError');

// const vars = require('../config/var');

const privateRoute = (req, res, next) => {
  const token = req.headers.authorization || req.cookies.token;
  if (!token) throw new ServerError('UNAUTHORIZED', 'token is required');

  const payload = Token.decode(token);

  if (!payload) throw new ServerError('UNAUTHORIZED', 'invalid token');
  if (!payload.type || payload.type !== 'user') throw new ServerError('UNAUTHORIZED', 'invalid token');

  req.user = new User(payload);

  next();
};

module.exports = privateRoute;
