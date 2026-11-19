const ServerError = require('../../utility/serverError');
const Constants = require('../../config/constant');

const getNestedValue = (obj, key) => key.split('.').reduce((o, k) => o && o[k], obj);

const hasPermission = (permission) => {
  if (!getNestedValue(Constants.modules.rootPermissions, permission)) throw new Error(`Permission ${permission} not found in valid permissions`);

  async function checkPermission(req, res, next) {
    if (req.user.isRootUser) return next();
    try {
      const userPermissions = await req.user.fetchUserPermissionsForPg(req.params.pgId);
      if (getNestedValue(userPermissions, permission)) return next();
      throw new ServerError('PERMISSION_DENIED', 'You do not have permission to perform this action');
    } catch (err) {
      return next(err);
    }
  }

  return checkPermission;
};

module.exports = hasPermission;
