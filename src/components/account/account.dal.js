const { Parameter } = require('../../lib/queryBuilder');
// #region Create
/**
 * @returns {Promise<{
 * id: string,
 * email: string,
 * phone: string,
 * password: string,
 * }>}
 */
exports.create = async (dbClient, data) => {
  const { name, email, phone, password, isEmailVerified } = data;

  const sqlStmt = `
      INSERT INTO "account"
        ("name","email", "phone", "password", "isEmailVerified")
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        "id","name","email","phone","password","accountNumber";
    `;
  const values = [name, email, phone, password, isEmailVerified];

  const result = await dbClient.query(sqlStmt, values);
  return result.rows[0];
};
// #endregion

// #region CreateRootUserForAccount
exports.createRootUserForAccount = async (dbClient, accountId) => {
  const sqlStmt = `
      INSERT INTO "user"
        ("accountId", "username", "isRootUser")
      VALUES
        ($1, 'root', TRUE)
      RETURNING
        "id",
        "username",
        "isRootUser",
        "accountId";
    `;

  const params = [accountId];
  const result = await dbClient.query(sqlStmt, params);
  return result.rows[0];
};
// #endregion

// #region FindByEmailOrPhone
/**
* @returns {Promise<{
* id: string,
* name: string,
* email: string,
* phone: string,
* password: string,
* isEmailVerified: boolean,
* isVerified: boolean}>
* }
*/
exports.findWithEmailAndPhone = async (dbClient, email, phone) => {
  const sqlStmt = `
      SELECT
        "id",
        "name",
        "email",
        "phone",
        "password",
        "isEmailVerified",
        "isVerified"
      FROM "account"
      WHERE
        "isDeleted" = FALSE AND
        (
          "email" = $1 OR
          "phone" = $2
        );
    `;
  const result = await dbClient.query(sqlStmt, [email, phone]);
  return result.rows[0];
};
// #endregion

// #region VerifyAccount
/**
 * @returns {Promise<{
 * id: string,
 * email: string,
 * phone: string,
 * isEmailVerified: boolean,
 * isVerified: boolean}>
 * }
 */
exports.verifyAccount = async (dbClient, accountId) => {
  const sqlStmt = `
      UPDATE "account"
      SET
        "isEmailVerified" = TRUE,
        "isVerified" = TRUE
      WHERE
        "id" = $1
      RETURNING
        "id",
        "email",
        "phone",
        "isEmailVerified",
        "isVerified";
    `;
  const values = [accountId];

  const result = await dbClient.query(sqlStmt, values);
  return result.rows[0];
};
// #endregion

// #region FindByEitherEmailOrPhone
/**
 * @returns {Promise<{
 * id: string,
 * name: string,
 * email: string,
 * phone: string,
 * password: string,
 * isEmailVerified: boolean,
 * isVerified: boolean}>
 * }
 */
exports.findByEmailOrPhone = async (dbClient, emailOrPhone) => {
  const sqlStmt = `
      SELECT
        "id",
        "accountNumber",
        "name",
        "email",
        "phone",
        "password",
        "isEmailVerified",
        "isVerified"
      FROM "account"
      WHERE
        "isDeleted" = FALSE AND
        (
          "email" = $1 OR
          "phone" = $1
        );
    `;
  const result = await dbClient.query(sqlStmt, [emailOrPhone]);
  return result.rows[0];
};
// #endregion

exports.getRootUserOfAccount = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      "id",
      "username",
      "isRootUser"
    FROM "user"
    WHERE
      "accountId" = $1 AND
      "isRootUser" = TRUE AND
      "isDeleted" = FALSE;
  `;
  const params = [accountId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #region getUserByPgIdAndAccountId
/**
 * @returns {Promise<{
 * id: string,
 * username: string,
 * isRootUser: boolean,
 * pgId: string,
 * pgName: string,
 * pgType: string,
 * accountId: string
 * }}
 */
exports.getRootUserByAccountId = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      "id" ,
      "username",
      "isRootUser"
    FROM "user"
    WHERE
      "accountId" = $1 AND
      "username" = $2 AND
      "isDeleted" = FALSE;
  `;
  const params = [accountId, 'root'];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region FindByAccountId
/**
 * @returns {Promise<{
 * id: string,
 * name: string,
 * email: string,
 * phone: string,
 * isEmailVerified: boolean,
 * isVerified: boolean}>
 * }
 */
exports.findByAccountId = async (dbClient, accountId) => {
  const sqlStmt = `
      SELECT
        "id",
        "name",
        "email",
        "phone",
        "password",
        "isEmailVerified",
        "isVerified"
      FROM "account"
      WHERE
        "isDeleted" = FALSE AND
        "id" = $1;
    `;
  const result = await dbClient.query(sqlStmt, [accountId]);
  return result.rows[0];
};
// #endregion

// #region update
exports.update = async (dbClient, accountId, data) => {
  const pm = new Parameter();
  const fields = Object.keys(data);
  const setQuery = fields.map((field) => ` "${field}" = ${pm.i(data[field])} `);

  const sqlStmt = `
      UPDATE
        "account"
      SET
        ${setQuery.join(',')},
        "updatedAt" = ${pm.i(new Date().toISOString())}
      WHERE
        "id" = ${pm.i(accountId)}
      RETURNING ${fields.map((v) => `"${v}"`).join(',')};
    `;

  const result = await dbClient.query(sqlStmt, pm.values);
  return result.rows[0];
};
// #endregion

// #region Delete
exports.deleteAccount = async (dbClient, accountId) => {
  const sqlStmt = `
      UPDATE "account"
      SET
        "isDeleted" = TRUE,
        "deletedAt" = $2
      WHERE
        "isDeleted" = FALSE AND
        "id" = $1;
    `;

  const currentTimeStamp = new Date().toISOString();
  await dbClient.query(sqlStmt, [accountId, currentTimeStamp]);
};
// #endregion
