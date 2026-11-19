const { Parameter } = require('../../lib/queryBuilder');
const Vars = require('../../config/var');

// #region Create
exports.create = async (dbClient, pgId, userId, data) => {
  const {
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    checkInReading,
    checkInDate,
    deposit,
    roomId,
    emergencyPhone,
    profileImage,
    address,
    checkOutDate,
    info,
    dateOfNotice,
  } = data;

  const sqlQuery = `
      INSERT INTO "guest"
        (
          "pgId",
          "name",
          "email",
          "phone",
          "gender",
          "sharing",
          "rent",
          "checkInDate",
          "deposit",
          "roomId",
          "emergencyPhone",
          "profileImage",
          "address",
          "checkOutDate",
          "info",
          "createdBy",
          "checkInReading",
          "dateOfNotice"
        )
      VALUES
        (
          $pgId,
          $name,
          $email,
          $phone,
          $gender,
          $sharing,
          $rent,
          $checkInDate,
          $deposit,
          $roomId,
          $emergencyPhone,
          $profileImage,
          $address,
          $checkOutDate,
          $info,
          $createdBy,
          $checkInReading,
          $dateOfNotice
        )
      RETURNING
        *,
        (
          SELECT
            JSON_BUILD_OBJECT(
              'id', "id",
              'name', "name"
            )
          FROM "pg"
          WHERE "id" = $pgId
        ) AS "pg",
        (
          SELECT
            JSON_BUILD_OBJECT(
              'id', "id",
              'name', "name",
              'capacity', "capacity"
            )
          FROM "room"
          WHERE "id" = $roomId AND "pgId" = $pgId
        ) AS "room";
    `;

  const params = {
    pgId,
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    deposit,
    roomId,
    emergencyPhone,
    profileImage,
    address,
    info,
    userId,
    checkInReading,
    checkOutDate: checkOutDate?.toISOString(),
    dateOfNotice: dateOfNotice?.toISOString(),
    checkInDate: checkInDate?.toISOString(),
  };

  const result = await dbClient.queryOne(sqlQuery, params);
  return result;
};
// #endregion

// #region List
exports.list = async (dbClient, pgId, query) => {
  const { isDeleted = false } = query;

  const sqlQuery = `
      SELECT
        g."id" AS "id",
        g."name" AS "name",
        g."gender" AS "gender",
        g."email" AS "email",
        g."rent" AS "rent",
        g."phone" AS "phone",
        g."sharing" AS "sharing",
        g."deposit" AS "deposit",
        g."emergencyPhone" AS "emergencyPhone",
        g."checkInDate" AS "checkInDate",
        g."checkOutDate" AS "checkOutDate",
        g."dateOfNotice" AS "dateOfNotice",
        case
          when g."profileImage" is not null
          then
            concat('http://localhost:${Vars.port}/files/',g."profileImage")
          else
            g."profileImage"
        end AS "profileImage",
        g."info" AS "info",
        json_build_object(
          'id', r."id",
          'name', r."name",
          'capacity', r."capacity"
        ) AS "room"
      FROM "guest" g
      JOIN "room" r ON g."roomId" = r."id"
      WHERE
        g."pgId" = $1 AND
        g."isDeleted" = $2;
    `;
  const params = [pgId, isDeleted];
  const result = await dbClient.fastQueryAll(sqlQuery, params);
  return result;
};
// #endregion

// #region Get Guest By Id
exports.getGuestById = async (dbClient, pgId, guestId) => {
  const sqlQuery = `
  SELECT
    g."id",
    g."name",
    g."email",
    g."phone",
    g."deposit",
    g."rent",
    g."checkInReading",
    g."checkOutReading",
    g."sharing",
    g."gender",
    g."checkInDate",
    g."checkOutDate",
    g."emergencyPhone",
    g."dateOfNotice",
    g."address",
    g."info",
    g."meta",
    case
      when g."profileImage" is not null
      then
        concat('http://localhost:${Vars.port}/files/',g."profileImage")
      else
        g."profileImage"
    end AS "profileImage",
    JSON_BUILD_OBJECT(
      'id', r."id",
      'name', r."name",
      'capacity', r."capacity",
      'tags', r."tags",
      'info', r."info",
      'occupied', (SELECT COUNT( *) FROM "guest" WHERE "roomId" = r."id" AND "isDeleted" = FALSE),
      'booked', (SELECT COUNT( *) FROM "booking" WHERE "roomId" = r."id" AND "isDeleted" = FALSE)
    ) as "room",
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', gd."id",
          'name', gd."name",
          'image', CONCAT('http://localhost:${Vars.port}/files/', gd."image")
        )
      ) FILTER (WHERE gd."id" IS NOT NULL), '[]'
    ) as "documents"
  FROM "guest" g
  JOIN "room" r ON g."roomId" = r."id"
  LEFT JOIN "guestDocument" gd ON g."id" = gd."guestId"
  WHERE
    g."pgId" = $1 AND
    g."isDeleted" = FALSE AND
    g."id" = $2
  GROUP BY g."id", r."id";
  `;
  const params = [pgId, guestId];
  const result = await dbClient.fastQueryOne(sqlQuery, params);
  return result;
};

// #endregion

// #region By Phone And Pg Code
/**
 * @returns {Promise<{
 * id: string,
 * phone: string,
 * isPhoneVerified: boolean,
 * isEmailVerified: boolean}>
 * }
 */
exports.findGuestByPhoneNumberAndPgCode = async (dbClient, pgCode, phone) => {
  const sqlQuery = `
      SELECT
        g."id" as "id",
        g."phone" as "phone",
        g."isPhoneVerified" as "isPhoneVerified",
        g."isEmailVerified" as "isEmailVerified"
      FROM "guest" g
      LEFT JOIN "pg" pg ON g."pgId" = pg."id"
      WHERE
        g."isDeleted" = FALSE AND
        pg."code" = $1 AND
        g."phone" = $2;
    `;
  const params = [pgCode, phone];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region Update
exports.update = async (dbClient, pgId, guestId, data) => {
  const pm = new Parameter();
  const fields = Object.keys(data);
  const setQuery = fields.map((field) => {
    if (field === 'meta') return ` "${field}" = "${field}" || ${pm.i(data[field])} `;
    return ` "${field}" = ${pm.i(data[field])} `;
  });

  const sqlQuery = `
      UPDATE
        "guest"
      SET
        ${setQuery.join(',')}
      WHERE
        "pgId" = ${pm.i(pgId)} AND
        "isDeleted" = FALSE AND
        "id" = ${pm.i(guestId)}
      RETURNING  ${fields.map((v) => `"${v}"`).join(',')};
  `;

  const result = await dbClient.query(sqlQuery, pm.values);
  return result.rows[0];
};
// #endregion

// #region Delete

exports.delete = async (dbClient, pgId, userId, guestId) => {
  const sqlQuery = `
      UPDATE
        "guest"
      SET
        "isDeleted" = TRUE,
        "deletedBy" = $2,
        "deletedAt" = $4
      WHERE
        "pgId" = $1 AND
        "isDeleted" = FALSE AND
        "id" = $3
      RETURNING
        "id";
    `;

  const currentTimeStamp = new Date().toISOString();
  const params = [pgId, userId, guestId, currentTimeStamp];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region UploadDocument

exports.uploadDocument = async (dbClient, pgId, guestId, { name, image }) => {
  const sqlQuery = `
      INSERT INTO "guestDocument"
        (
          "pgId",
          "guestId",
          "name",
          "image"
        )
      VALUES ($1, $2, $3 ,$4)
      RETURNING
        "id",
        "name",
        "image";
    `;

  const params = [pgId, guestId, name, image];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region GetDocumentById

exports.getDocumentById = async (dbClient, pgId, documentId) => {
  const sqlQuery = `
      SELECT
        "id","image"
      FROM "guestDocument"
      WHERE
        "pgId" = $1 AND
        "id" = $2;
    `;

  const params = [pgId, documentId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region DeleteDocument

exports.deleteDocument = async (dbClient, pgId, documentId) => {
  const sqlQuery = `
      DELETE FROM "guestDocument"
      WHERE
        "pgId" = $1 AND
        "id" = $2
      RETURNING
        "id","image";
    `;

  const params = [pgId, documentId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region exportData
exports.exportData = async (dbClient, pgId, month, year) => {
  const today = new Date();
  const startDate = new Date(year, month - 1, today.getDate());

  const sqlQuery = `
      SELECT
        g."name",
        g."phone",
        g."checkInDate",
        g."checkOutDate",
        g."deposit",
        g."rent",
        g."dateOfNotice",
        CASE
          WHEN EXTRACT(MONTH FROM (g."meta"->'room'->>'changedAt')::timestamp) = $2
              AND EXTRACT(YEAR FROM (g."meta"->'room'->>'changedAt')::timestamp) = $3
          THEN g."meta"->'room'->>'previousRoomName'
          ELSE NULL
        END as "previousRoomName",
        CASE
          WHEN EXTRACT(MONTH FROM (g."meta"->'rent'->>'changedAt')::timestamp) = $2
              AND EXTRACT(YEAR FROM (g."meta"->'rent'->>'changedAt')::timestamp) = $3
          THEN g."meta"->'rent'->>'previousRent'
          ELSE NULL
        END as "previousRent",
        r."name" as "roomName"
      FROM "guest" g
      JOIN "room" r ON g."roomId" = r."id"
      WHERE
        g."pgId" = $1 AND
        g."isDeleted" = FALSE AND
        g."checkInDate" <= $4
      GROUP BY g."id", r."id";
    `;
  const params = [pgId, month, year, startDate];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};

// #endregion
