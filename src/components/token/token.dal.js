// #region create
exports.create = async (dbClient, { type, token, userId, expireAt, otp }) => {
  const sqlQuery = `
      INSERT INTO token("type", "token", "userId", "otp", "expireAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  const params = [type, token, userId, otp, expireAt];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region findByToken
exports.findByToken = async (dbClient, token, currentTimeStamp) => {
  const sqlQuery = `
      SELECT * FROM token
      WHERE
        "token" = $1 AND
        "expireAt" > $2;
    `;
  const params = [token, currentTimeStamp];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion
