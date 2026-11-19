const isLoggedIn = require('./isLoggedIn');
const isRootLoggedIn = require('./isRootLoggedIn');
const hasAccessToPg = require('./hasAccessToPg');
const hasPermission = require('./hasPermission');
const privateRoute = require('./privateRoute');

module.exports = {
  isLoggedIn,
  isRootLoggedIn,
  hasAccessToPg,
  hasPermission,
  privateRoute,
};
