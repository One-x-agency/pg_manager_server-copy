const { Parameter } = require('../../lib/queryBuilder');

// #region create
exports.create = async (dbClient, accountId, data) => {
  const { name, phone, email, type, address } = data;

  const sqlQuery = `
    INSERT INTO "pg"
      ("accountId", "name", "type", "phone", "email", "address")
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING
      "id", "name", "type", "phone", "email", "address";
  `;

  const params = [accountId, name, type, phone, email, address];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region listForRootUser

exports.listForRootUser = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      "id",
      "name",
      "type",
      "address",
      "phone"
    FROM "pg"
    WHERE
      "isDeleted" = FALSE AND
      "accountId" = $1;
  `;
  const params = [accountId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};

// #endregion

// #region listForUser

exports.listForUser = async (dbClient, userId) => {
  const sqlQuery = `
    SELECT
      "pg"."id",
      "pg"."name",
      "pg"."type",
      "pg"."address",
      "pg"."phone"
    FROM "userPgAccess" "upa"
    JOIN "pg" ON "upa"."pgId" = "pg"."id"
    WHERE
      "upa"."userId" = $1;
  `;
  const params = [userId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
// #region list
exports.list = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      "id",
      "name",
      "type",
      "address",
      "phone"
    FROM "pg"
    WHERE
      "isDeleted" = FALSE AND
      "accountId" = $1;
  `;
  const params = [accountId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
// #endregion

// #region getPgCode
exports.getPgCode = async (dbClient, code) => {
  const sqlQuery = `
    SELECT
      "id"
    FROM "pg"
    WHERE
      "isDeleted" = FALSE AND
      "code" = $1;
  `;
  const params = [code];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region findByPgId
exports.findByPgId = async (dbClient, pgId) => {
  const sqlQuery = `
    SELECT
      "id",
      "name",
      "type",
      "address",
      "email",
      "phone",
      "meta"
    FROM "pg"
    WHERE
      "isDeleted" = FALSE AND
      "id" = $1;
  `;
  const params = [pgId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// TODO : rename phone1 column to phone
// #region update
exports.update = async (dbClient, pgId, newData) => {
  const data = newData;
  const pm = new Parameter();
  const fieldsToUpdate = Object.keys(data);
  const setStmts = fieldsToUpdate.map((key) => `"${key}" = ${pm.i(data[key])}`);

  const sqlQuery = `
    UPDATE "pg"
    SET
      ${setStmts.join(',')},
      "updatedAt" = ${pm.i(new Date())}
    WHERE
      "id" = ${pm.i(pgId)}
      AND "isDeleted" = FALSE
    RETURNING
      ${fieldsToUpdate.map((v) => `"${v}"`).join(',')};
  `;

  const result = await dbClient.query(sqlQuery, pm.values);
  return result.rows[0];
};

exports.softDelete = async (dbClient, pgId) => {
  const currentTimeStamp = new Date().toISOString();
  const sqlQuery = `
    UPDATE "pg"
    SET
      "isDeleted" = TRUE,
      "deletedAt" = $1
    WHERE
      "id" = $2 AND
      "isDeleted" = FALSE
    RETURNING
      "id";
  `;
  const params = [currentTimeStamp, pgId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
