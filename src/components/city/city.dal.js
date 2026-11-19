// #region listCitiesByStateId
exports.listCitiesByStateId = async (dbClient, stateId) => {
  const sqlStmt = `
      SELECT
        "id","name"
      FROM "city"
      WHERE "stateId" = $1;
    `;
  const result = await dbClient.query(sqlStmt, [stateId]);
  return result.rows;
};
// #endregion
