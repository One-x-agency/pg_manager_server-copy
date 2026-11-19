// #region list
exports.list = async (dbClient) => {
  const sqlStmt = `
      SELECT
        "id","name"
      FROM "country";
    `;
  const result = await dbClient.query(sqlStmt);
  return result.rows;
};
// #endregion
