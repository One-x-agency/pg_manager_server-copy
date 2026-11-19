// #region Create
exports.create = async (dbClient, accountId, data) => {
  const { username, password, phone } = data;
  const sqlQuery = `
    INSERT INTO "user"
      ("accountId", "username", "password", "phone")
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      "id",
      "accountId",
      "username",
      "phone";
  `;
  const params = [accountId, username, password, phone];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region getUserById
exports.getUserById = async (dbClient, accountId, userId) => {
  const sqlQuery = `
    SELECT
      "id",
      "username",
      "phone"
    FROM "user"
    WHERE
    "id" = $1 AND
    "accountId" = $2 AND
    "isRootUser" = FALSE AND
    "isDeleted" = FALSE`;
  const result = await dbClient.query(sqlQuery, [userId, accountId]);
  return result.rows[0];
};
// endregion

// #region ListUserByAccountId
exports.listUserByAccountId = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      u."id",
      u."username",
      u."phone",
      u."createdAt",
      COALESCE(
        array_agg(upa."pgId") FILTER (WHERE upa."pgId" IS NOT NULL),
        '{}'
      ) AS "allocatedPgs"
    FROM "user" u
    LEFT JOIN "userPgAccess" upa ON u."id" = upa."userId"
    WHERE
      u."isRootUser" = false AND
      u."isDeleted" = false AND
      u."accountId" = $1
    GROUP BY
      u."id";
  `;
  const result = await dbClient.query(sqlQuery, [accountId]);
  return result.rows;
};
// #endregion

// #region ListUserByAccountAndPgId
exports.listUserByAccountAndPgId = async (dbClient, accountId, pgId) => {
  const sqlQuery = `
    SELECT
      u."id",
      u."username",
      u."phone",
      u."createdAt",
      COALESCE(
        array_agg(upa."pgId") FILTER (WHERE upa."pgId" IS NOT NULL),
        '{}'
      ) AS "allocatedPgs"
    FROM "user" u
    LEFT JOIN "userPgAccess" upa ON u."id" = upa."userId"
    WHERE
      u."isRootUser" = false AND
      u."isDeleted" = false AND
      u."accountId" = $1
    GROUP BY
      u."id"
    HAVING
      $2 = ANY(array_agg(upa."pgId"));
  `;
  const result = await dbClient.query(sqlQuery, [accountId, pgId]);
  return result.rows;
};
// #endregion

// #region getUserByUsernameOrPhoneAndAccountId
exports.getUserByUsernameOrPhoneAndAccountId = async (dbClient, usernameOrPhone, accountNumber) => {
  const sqlQuery = `
    SELECT
      u."id",
      u."isRootUser",
      u."username",
      u."phone",
      u."password",
      u."accountId",
      a."accountNumber"
    FROM "user" u
    JOIN "account" a ON u."accountId" = a."id"
    WHERE
      a."accountNumber" = $1 AND
      (
          u."username" = $2 OR
          u."phone" = $2
      ) AND
    u."isDeleted" = FALSE
  `;
  const result = await dbClient.query(sqlQuery, [accountNumber, usernameOrPhone]);
  return result.rows[0];
};
// #endregion

// #region Update
exports.update = async (dbClient, accountId, userId, data) => {
  const { username, password, phone } = data;

  const sqlQuery = `
      UPDATE "user"
      SET
        "username" = $1,
        ${password ? '"password" = $6,' : ''}
        "phone" = $2,
        "updatedAt" = $5
      WHERE
        "accountId" = $3 AND
        "isDeleted" = FALSE AND
        "id" = $4
      RETURNING
        "id",
        "username",
        "phone";
  `;

  const currentTimeStamp = new Date().toISOString();
  const params = [username, phone, accountId, userId, currentTimeStamp];
  if (password) params.push(password);

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region Delete
exports.delete = async (dbClient, userId, accountId) => {
  const sqlQuery = `
      UPDATE
        "user"
      SET
        "isDeleted" = TRUE,
        "deletedAt" = $3
      WHERE
        "accountId" = $1 AND
        "isDeleted" = FALSE AND
        "id" = $2
      RETURNING
        "id";
    `;

  const currentTimeStamp = new Date().toISOString();
  const params = [accountId, userId, currentTimeStamp];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region deallocateAllPg
exports.deallocateAllPgs = async (dbClient, userId) => {
  const sqlQuery = `
      DELETE FROM "userPgAccess"
      WHERE "userId" = $1;
    `;

  const result = await dbClient.query(sqlQuery, [userId]);

  return result.rows[0];
};
// #endregion

// #region deallocatePg
exports.deallocatePg = async (dbClient, userId, pgId) => {
  const sqlQuery = `
      DELETE FROM "userPgAccess"
      WHERE "userId" = $1 AND "pgId" = $2
      RETURNING "pgId";
    `;

  const result = await dbClient.query(sqlQuery, [userId, pgId]);

  return result.rows[0];
};
// #endregion

// #region listPgByAccountId
exports.listPgByAccountId = async (dbClient, accountId) => {
  const sqlQuery = `
    SELECT
      "id"
    FROM "pg"
    WHERE
      "accountId" = $1 AND
      "isDeleted" = FALSE;
  `;

  const result = await dbClient.query(sqlQuery, [accountId]);
  return result.rows;
};
// #endregion

// #region fetchUserPgAccessForUser
exports.fetchUserPgAccessForUser = async (dbClient, userId, isRootUser) => {
  const sqlQueryForUser = `
    SELECT
      "pgId" as "id",
      "meta"
    FROM "userPgAccess"
    WHERE
      "userId" = $1;
  `;

  const sqlQueryForRootUser = `
    SELECT
      "id"
    FROM "pg"
    WHERE
      "accountId" = (
        SELECT
          "accountId"
        FROM "user"
        WHERE
          "id" = $1 AND
          "isRootUser" = TRUE
      );
  `;

  if (isRootUser) {
    const result = await dbClient.query(sqlQueryForRootUser, [userId]);
    return result.rows;
  }
  const result = await dbClient.query(sqlQueryForUser, [userId]);
  return result.rows;
};
// #endregion

// #region getUserById

exports.getUserById = async (dbClient, accountId, userId) => {
  const sqlQuery = `
    SELECT
      u."id" as "id",
      u."username" as "username",
      u."phone" as "phone",
      u."createdAt" as "createdAt",
      COALESCE(
        array_agg(
          json_build_object(
            'id', upa."pgId",
            'permission', upa."meta"
          )
        ) FILTER (WHERE upa."pgId" IS NOT NULL),
        '{}'
      ) AS "pgs"
    FROM "user" u
    LEFT JOIN "userPgAccess" upa ON u."id" = upa."userId"
    WHERE
      u."id" = $1 AND
      u."accountId" = $2 AND
      u."isRootUser" = FALSE AND
      u."isDeleted" = FALSE
    GROUP BY
      u."id";`;

  const result = await dbClient.query(sqlQuery, [userId, accountId]);
  return result.rows[0];
};
// #endregion

// #region fetchUserPermissionsForPg
exports.upsertUserPgAccess = async (dbClient, userId, pgId, permission) => {
  const sqlQuery = `
    INSERT INTO "userPgAccess"
      ("userId", "pgId", "meta")
    VALUES
      ($1, $2, $3)
    ON CONFLICT ON CONSTRAINT "uc_userPgAccess_userId_pgId"
    DO UPDATE SET
      "meta" = $3
    RETURNING
      "pgId",
      "meta" as "permission";
  `;

  const result = await dbClient.query(sqlQuery, [userId, pgId, permission]);
  return result.rows[0];
};
// #endregion
