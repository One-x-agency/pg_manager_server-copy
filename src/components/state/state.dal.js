// #region listStatesByCountryId
exports.listStatesByCountryId = async (dbClient, countryId) => {
  const sqlStmt = `
      SELECT
        "id","name"
      FROM "state"
      WHERE "countryId" = $1;
    `;
  const result = await dbClient.query(sqlStmt, [countryId]);
  return result.rows;
};
// #endregion
