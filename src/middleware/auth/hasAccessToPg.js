const ServerError = require('../../utility/serverError');

const hasAccessToPg = async (req, res, next) => {
  try {
    if (!await req.user.hasAccessToPg(req.params.pgId)) throw new ServerError('PERMISSION_DENIED', 'You do not have access to this PG');
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = hasAccessToPg;
