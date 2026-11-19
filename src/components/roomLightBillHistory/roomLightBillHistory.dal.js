const Vars = require('../../config/var');

// #region create
/**
 * @returns {Promise<{
 * id: string,
 * roomId: string,
 * image: string,
 * month: number,
 * year: number,
 * reading: number,
 * amount: number,
 * unitPrice: number,
 * }}
 */

exports.create = async (dbClient, pgId, roomId, userId, data) => {
  const { month, year, image, reading, amount, unitPrice } = data;

  const sqlQuery = `
    INSERT INTO "roomLightBillHistory" (
      "pgId",
      "roomId",
      "image",
      "reading",
      "amount",
      "month",
      "year",
      "unitPrice",
      "createdBy"
    )
    SELECT
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    WHERE EXISTS (
      SELECT 1
      FROM "room"
      WHERE
        "pgId" = $1 AND
        "id" = $2
    )
    RETURNING
      "id",
      "roomId",
      "image",
      "reading",
      "amount",
      "month",
      "year",
      "unitPrice",
      "createdBy";
  `;

  const params = [pgId, roomId, image, reading, amount, month, year, unitPrice, userId];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region list
/**
 * @returns {Promise<{
 * id: string,
 * image: string,
 * date: string,
 * reading: string,
 * amount: number,
 * rate: number,
 * }}
 */
exports.list = async (dbClient, pgId, roomId) => {
  const sqlQuery = `
    SELECT
      "id",
      case
        when "image" is not null then
          concat('http://localhost:${Vars.port}/files/',"image")
        else "image"
      end as "image",
      "month",
      "year",
      "reading" :: FLOAT,
      "unitPrice" :: FLOAT,
      "amount" :: FLOAT
    FROM
      "roomLightBillHistory"
    WHERE
      "pgId" = $1 AND
      "roomId" = $2 AND
      "isDeleted" = FALSE;
  `;

  const params = [pgId, roomId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
// #endregion

// #region update
/**
 * @returns {Promise<{
 * id: string,
 * roomId: string,
 * image: string,
 * month: number,
 * year: number,
 * reading: number,
 * amount: number,
 * rate: number,
 * }}
 */
exports.update = async (dbClient, userId, pgId, roomLightBillId, data) => {
  const { image, reading, amount, unitPrice } = data;

  const sqlQuery = `
    UPDATE "roomLightBillHistory"
    SET
      "reading" = $3,
      "amount" = $4,
      "image" = $7,
      "unitPrice" = $8,
      "updatedAt" = $5,
      "updatedBy" = $6
    WHERE
      "id" = $1
      AND "pgId" = $2
      AND "isDeleted" = FALSE
    RETURNING
      "id",
      "roomId",
      "image",
      "month",
      "year",
      "reading",
      "amount",
      "unitPrice",
      "createdBy";
  `;

  const updatedAt = new Date().toISOString();
  const params = [roomLightBillId, pgId, reading, amount, updatedAt, userId, image, unitPrice];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region delete
exports.delete = async (dbClient, userId, roomLightBillId, deletedAt) => {
  const sqlQuery = `
    UPDATE "roomLightBillHistory"
    SET
      "isDeleted" =$2,
      "deletedBy"=$3,
      "deletedAt"=$4
    WHERE
      "id" = $1
    RETURNING
      "id";
  `;

  const params = [roomLightBillId, true, userId, deletedAt];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region getById
exports.getById = async (dbClient, pgId, roomLightBillId) => {
  const sqlQuery = `
  SELECT
  "id",
  "roomId",
  "image",
  "reading" :: FLOAT,
  "amount" :: FLOAT,
  "month",
  "year",
  "unitPrice" :: FLOAT,
  "createdBy",
  "updatedAt",
  "updatedBy"
  FROM "roomLightBillHistory"
  WHERE
  "pgId" = $1
  AND "id" = $2
  AND "isDeleted" = FALSE;
  `;
  const params = [pgId, roomLightBillId];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion
