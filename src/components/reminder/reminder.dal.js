// #region upsertMonthlyReminder
exports.upsert = async (dbClient, pgId, userId, data) => {
  const { reference, description, date, type } = data;

  const sqlQuery = `
    INSERT INTO "reminder"
      (
        "pgId",
        "type",
        "reference",
        "date",
        "description",
        "createdBy",
        "updatedBy"
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $6)
    ON CONFLICT ("pgId", "reference")
    WHERE "type" = 'monthlyPayment' AND "isDeleted" = FALSE
    DO UPDATE SET
      "date" = $4,
      "description" = $5,
      "updatedBy" = $6,
      "updatedAt" = $7
    RETURNING
      "id",
      "date",
      "description",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt";
  `;

  const currentTimeStamp = new Date().toISOString();
  const params = [pgId, type, reference, date?.toISOString(), description, userId, currentTimeStamp];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region list
exports.list = async (dbClient) => {
  const sqlQuery = `
    SELECT
      "id",
      "type",
      "pgId",
      "reference",
      "date",
      "description",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt"
    FROM "reminder"
    WHERE
      "isDeleted" = FALSE;
  `;
  const result = await dbClient.query(sqlQuery);
  return result.rows;
};
// #endregion
