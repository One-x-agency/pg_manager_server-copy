const Vars = require('../../config/var');

// #region Create
/**
 * @returns {Promise<{
 * id: string,
 * name: string,
 * capacity: number,
 * rent: number,
 * isAc: boolean,
 * tags: string[],
 * info: string,
 * }>}
 */
exports.create = async (dbClient, pgId, userId, data) => {
  const { name, capacity, rent, tags, info } = data;

  const sqlStmt = `
    INSERT INTO "room"
      (
        "pgId",
        "name",
        "capacity",
        "rent",
        "tags",
        "info",
        "createdBy",
        "updatedBy"
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $7)
    RETURNING
      "id",
      "name",
      "capacity",
      "rent",
      "tags",
      "info";
  `;
  const params = [pgId, name, capacity, rent, tags, info, userId];
  const result = await dbClient.query(sqlStmt, params);
  return result.rows[0];
};
// #endregion

// #region List
/**
 * @returns {Promise<{
 * id: string,
 * name: string,
 * capacity: number,
 * rent: number,
 * isAc: boolean,
 * tags: string[],
 * info: string,
 * occupied: number,
 * }[]>}
 */
exports.list = async (dbClient, pgId) => {
  const sqlStmt = `
    SELECT
      r."id" AS "id",
      r."name" AS "name",
      r."capacity" AS "capacity",
      r."rent" AS "rent",
      r."tags" AS "tags",
      r."info" AS "info",
      COUNT(DISTINCT g."id")::INTEGER AS "occupied",
      COUNT(DISTINCT b."id")::INTEGER AS "booked"
    FROM "room" r
    LEFT JOIN "guest" g ON
      r."id" = g."roomId" AND
      g."isDeleted" = FALSE
    LEFT JOIN "booking" b ON
      r."id" = b."roomId" AND
      b."isDeleted" = FALSE
    WHERE
      r."pgId" = $1 AND
      r."isDeleted" = FALSE
    GROUP BY
      r."id"
  `;

  const result = await dbClient.query(sqlStmt, [pgId]);
  return result.rows;
};
// #endregion

// #region Get Room By Id
/**
 * @returns {Promise<{
 * id: string,
 * name: string,
 * capacity: number,
 * rent: number,
 * isAc: boolean,
 * tags: string[],
 * info: string,
 * guests: [{
 *  id: string,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  phone: string,
 *  sharing: string,
 *  rent: number
 *  gender: string,
 *  checkInDate: string,
 *  deposit: number
 * }]
 * }>}
 */
exports.getRoomById = async (dbClient, pgId, roomId) => {
  const sqlStmt = `
    SELECT
      r."id" AS "id",
      r."name" AS "name",
      r."capacity" AS "capacity",
      r."rent" AS "rent",
      r."tags" AS "tags",
      r."info" AS "info",
      COALESCE(
        ARRAY_AGG(
          json_build_object(
            'id', g."id",
            'name', g."name",
            'email', g."email",
            'phone', g."phone",
            'sharing', g."sharing",
            'rent', g."rent",
            'gender', g."gender",
            'checkInDate', g."checkInDate",
            'profileImage',
              CASE
                WHEN g."profileImage" IS NOT NULL THEN
                  CONCAT('https://${Vars.aws.s3.bucket}.s3.${Vars.aws.region}.amazonaws.com/', g."profileImage")
                ELSE
                  g."profileImage"
              END,
            'deposit', g."deposit"
          )
        ) FILTER (WHERE g."id" IS NOT NULL),
        '{}'
      ) AS "guests"
    FROM "room" r
    LEFT JOIN "guest" g ON
      r."id" = g."roomId"
      AND g."isDeleted" = FALSE
    WHERE
      r."pgId" = $1
      AND r."isDeleted" = FALSE
      AND r."id" = $2
    GROUP BY
      r."id";
  `;

  const result = await dbClient.query(sqlStmt, [pgId, roomId]);
  return result.rows[0];
};

// #endregion

// #region Delete
exports.deleteRoomById = async (dbClient, roomId) => {
  const sqlStmt = `
    UPDATE "room"
    SET
      "isDeleted" = TRUE,
      "deletedAt" = $2
    WHERE
      "isDeleted" = FALSE AND
      "id" = $1;
  `;

  const currentTimeStamp = new Date().toISOString();
  await dbClient.query(sqlStmt, [roomId, currentTimeStamp]);
};
// #endregion

// #region Update
exports.updateRoomById = async (dbClient, userId, roomId, data) => {
  const updatedAt = new Date().toISOString();
  const { name, capacity, rent, tags, info } = data;
  const sqlStmt = `
    UPDATE "room"
    SET
      "name" = $1,
      "capacity" = $2,
      "rent" = $3,
      "tags" = $4,
      "info" = $5,
      "updatedBy" = $6,
      "updatedAt" = $7
    WHERE
      "id" = $8
    RETURNING *;
  `;
  const params = [name, capacity, rent, tags, info, userId, updatedAt, roomId];
  const result = await dbClient.query(sqlStmt, params);
  return result.rows[0];
};
// #endregion

// #region Get Room Details For Bill Calculation
exports.getRoomDetailsForBillCalculation = async (dbClient, pgId, roomId) => {
  const sqlStmt = `
    SELECT
        r."id",
        r."capacity",
        r."name",
        (
          SELECT
            json_agg(
              json_build_object(
                'id', g."id",
                'name', g."name",
                'checkInDate', g."checkInDate",
                'checkOutDate', g."checkOutDate",
                'checkInReading', g."checkInReading"::FLOAT,
                'checkOutReading', g."checkOutReading"::FLOAT
              )
            )
          FROM "guest" g
          WHERE
            g."pgId" = r."pgId"
            AND g."roomId" = r."id"
            AND g."isDeleted" = FALSE
        ) AS "guests",
        (
          SELECT
            json_agg(
              json_build_object(
                'reading', rbh_s."reading"::FLOAT,
                'unitPrice', rbh_s."unitPrice"::FLOAT,
                'month', rbh_s."month",
                'year', rbh_s."year"
              )
            )
          FROM (
            SELECT
              rbh."reading",
              rbh."unitPrice",
              rbh."month",
              rbh."year"
            FROM "roomLightBillHistory" rbh
            WHERE
              rbh."pgId" = r."pgId"
              AND rbh."roomId" = r."id"
              AND rbh."isDeleted" = FALSE
            ORDER BY
              rbh."year" DESC,
              rbh."month" DESC
            LIMIT 2
          ) AS rbh_s
        ) AS "roomLightBillHistory"
    FROM "room" r
    WHERE
        r."pgId" = $1
        AND r."isDeleted" = FALSE
        AND r."id" = $2;
  `;

  const result = await dbClient.query(sqlStmt, [pgId, roomId]);
  return result.rows[0];
};
// #endregion

exports.roomListExport = async (dbClient, pgId) => {
  const sqlStmt = `
    WITH RoomReadings AS (
      SELECT
        "roomId",
        "unitPrice",
        "month",
        "year",
        "reading",
        ROW_NUMBER() OVER (PARTITION BY "roomId" ORDER BY "year" DESC, "month" DESC) AS "rank"
      FROM "roomLightBillHistory"
      WHERE
        "isDeleted" = FALSE
    )
    SELECT
      r."id" AS "id",
      r."name" AS "name",
      r."capacity" :: INTEGER AS "capacity",
      r."rent" :: INTEGER AS "rent",
      r."tags" AS "tags",
      r."info" AS "info",
      COUNT(g."id")::INTEGER AS "occupied",
      (rr1."month" || '-' || rr1."year") AS "currentMonth",
      (rr2."month" || '-' || rr2."year") AS "previousMonth",
      rr1."reading" :: FLOAT AS "currentReading",
      rr2."reading" :: FLOAT AS "previousReading",
      rr1."unitPrice" :: FLOAT AS "unitPrice"
    FROM "room" r
    LEFT JOIN RoomReadings rr1 ON
      rr1."roomId" = r."id" AND
      rr1."rank" = 1
    LEFT JOIN RoomReadings rr2 ON
      rr2."roomId" = r."id" AND
      rr2."rank" = 2
    LEFT JOIN "guest" g ON
      r."id" = g."roomId"
      AND g."isDeleted" = FALSE
    WHERE
      r."pgId" = $1 AND
      r."isDeleted" = FALSE
    GROUP BY
      r."id" ,
      rr1."month",
      rr1."year",
      rr1."reading",
      rr1."unitPrice",
      rr2."month",
      rr2."year",
      rr2."reading",
      rr2."unitPrice";
  `;

  const result = await dbClient.query(sqlStmt, [pgId]);
  return result.rows;
};
