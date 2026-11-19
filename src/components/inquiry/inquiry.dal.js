const { Parameter } = require('../../lib/queryBuilder');

// #region Create
exports.create = async (dbClient, pgId, userId, data) => {
  const {
    name,
    phone,
    gender,
    sharing,
    message,
    status,
    token,
  } = data;

  const sqlQuery = `
    INSERT INTO "inquiry"
      (
        "pgId",
        "name",
        "phone",
        "gender",
        "sharing",
        "message",
        "status",
        "token",
        "createdBy"
      )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      "id", "name", "phone", "gender", "sharing", "message" ,"status";
  `;

  const params = [
    pgId,
    name,
    phone,
    gender,
    sharing,
    message,
    status,
    token,
    userId,
  ];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region List
exports.list = async (dbClient, pgId) => {
  const sqlQuery = `
    SELECT
      *
    FROM "inquiry"
    WHERE
      "pgId" = $1 AND
      "isDeleted" = false;
  `;

  const result = await dbClient.query(sqlQuery, [pgId]);
  return result.rows;
};
// #endregion

// #region Update
exports.update = async (dbClient, pgId, userId, inquiryId, data) => {
  const pm = new Parameter();
  const fields = Object.keys(data);
  const setQuery = fields.map((field) => ` "${field}" = ${pm.i(data[field])} `);

  const sqlQuery = `
      UPDATE
        "inquiry"
      SET
        ${setQuery.join(',')},
        "updatedBy" = ${pm.i(userId)},
        "updatedAt" = ${pm.i(new Date().toISOString())}
      WHERE
        "pgId" = ${pm.i(pgId)} AND
        "isDeleted" = FALSE AND
        "id" = ${pm.i(inquiryId)}
      RETURNING  ${fields.map((v) => `"${v}"`).join(',')};
  `;

  const result = await dbClient.query(sqlQuery, pm.values);
  return result.rows;
};
// #endregion

// #region Delete
exports.delete = async (dbClient, pgId, id, inquiryId) => {
  const sqlQuery = `
    UPDATE "inquiry"
    SET
      "isDeleted" = true,
      "deletedBy"= $1,
      "deletedAt"= $2
    WHERE
      "pgId" = $3 AND
      "id" = $4;
  `;

  const params = [id, new Date().toISOString(), pgId, inquiryId];
  await dbClient.query(sqlQuery, params);
};
// #endregion
