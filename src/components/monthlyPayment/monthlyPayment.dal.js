// #region Create
exports.create = async (dbClient, pgId, userId, data) => {
  const { month, year, guestId, remark, rent, lightBill, date, rentPaymentMethod, lightBillPaymentMethod } = data;

  const sqlQuery = `
      INSERT INTO "monthlyPayment"
        (
          "pgId",
          "guestId",
          "rent",
          "lightBill",
          "month",
          "year",
          "remark",
          "date",
          "rentPaymentMethod",
          "lightBillPaymentMethod",
          "createdBy",
          "updatedBy"
        )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      RETURNING
        "id",
        "month",
        "year",
        "rent",
        "lightBill",
        "remark",
        "date",
        "rentPaymentMethod",
        "lightBillPaymentMethod",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy";
    `;

  const params = [pgId, guestId, rent, lightBill, month, year, remark, date, rentPaymentMethod, lightBillPaymentMethod, userId];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region ListByGuestId
exports.listByGuestId = async (dbClient, pgId, query) => {
  const { guestId } = query;

  const sqlQuery = `
      SELECT
        "id",
        "month",
        "year",
        "rent",
        "lightBill",
        "remark",
        "date",
        "rentPaymentMethod",
        "lightBillPaymentMethod",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy"
      FROM "monthlyPayment"
      WHERE
        "pgId" = $1 AND
        "guestId" = $2 AND
        "isDeleted" = FALSE;
    `;

  const result = await dbClient.query(sqlQuery, [pgId, guestId]);
  return result.rows;
};
// #endregion

// #region update
exports.update = async (dbClient, pgId, userId, monthlyPaymentId, data) => {
  const { rent, lightBill, remark, date, rentPaymentMethod, lightBillPaymentMethod } = data;
  const currentTimeStamp = new Date().toISOString();

  const sqlQuery = `
      UPDATE "monthlyPayment"
      SET
        "rent" = $1,
        "lightBill" = $2,
        "remark" = $3,
        "date" = $4,
        "rentPaymentMethod" = $5,
        "lightBillPaymentMethod" = $6,
        "updatedBy" = $7,
        "updatedAt" = $8
      WHERE
        "pgId" = $9 AND
        "id" = $10
      RETURNING
        "id",
        "month",
        "year",
        "rent",
        "lightBill",
        "remark",
        "date",
        "rentPaymentMethod",
        "lightBillPaymentMethod",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy";
    `;

  const params = [rent, lightBill, remark, date, rentPaymentMethod, lightBillPaymentMethod, userId, currentTimeStamp, pgId, monthlyPaymentId];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region delete
exports.delete = async (dbClient, pgId, userId, monthlyPaymentId) => {
  const sqlQuery = `
      UPDATE "monthlyPayment"
      SET
        "isDeleted" = TRUE,
        "deletedBy" = $3,
        "deletedAt" = $4
      WHERE
        "pgId" = $1 AND
        "id" = $2;
    `;

  const currentTimeStamp = new Date().toISOString();
  await dbClient.query(sqlQuery, [pgId, monthlyPaymentId, userId, currentTimeStamp]);
};
// #endregion

// #region upsert
exports.upsert = async (dbClient, pgId, userId, data) => {
  const { month, year, guestId, remark, rent, lightBill, date, rentPaymentMethod, lightBillPaymentMethod } = data;

  const sqlQuery = `
      INSERT INTO "monthlyPayment"
        (
          "pgId",
          "guestId",
          "rent",
          "lightBill",
          "month",
          "year",
          "remark",
          "date",
          "rentPaymentMethod",
          "lightBillPaymentMethod",
          "createdBy",
          "updatedBy"
        )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      ON CONFLICT ("guestId", "month", "year")
      WHERE "isDeleted" = FALSE
      DO UPDATE
      SET
        "rent" = $3,
        "lightBill" = $4,
        "remark" = $7,
        "date" = $8,
        "rentPaymentMethod" = $9,
        "lightBillPaymentMethod" = $10,
        "updatedBy" = $11,
        "updatedAt" = $12
      RETURNING
        "id",
        "month",
        "year",
        "rent",
        "lightBill",
        "remark",
        "date",
        "rentPaymentMethod",
        "lightBillPaymentMethod",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy";
    `;

  const currentTimeStamp = new Date().toISOString();
  const params = [pgId, guestId, rent, lightBill, month, year, remark, date, rentPaymentMethod, lightBillPaymentMethod, userId, currentTimeStamp];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region monthlyCollection
exports.monthlyCollection = async (dbClient, pgId, query) => {
  const { month, year } = query;
  const sqlQuery = `
      SELECT
        "month",
        "year",
        SUM("rent") as "totalRent",
        SUM("lightBill") as "totalLightBill"
      FROM "monthlyPayment"
      WHERE
        "pgId" = $1 AND
        "isDeleted" = FALSE AND
        "month" = $2 AND
        "year" = $3
      GROUP BY
        "month",
        "year"
      HAVING
        month = $2 AND
        year = $3;
      ORDER BY
        "year" DESC,
        "month" DESC;
    `;

  const result = await dbClient.query(sqlQuery, [pgId, month, year]);
  return result.rows[0];
};
// #endregion

// #region exportData

// guest name and number / date of checkIn / rent / lightBill / rentPaymentMethod / lightBillPaymentMethod / deposit
exports.exportData = async (dbClient, pgId, month, year) => {
  const sqlQuery = `
    SELECT
      g."name" as "name",
      g."phone" as "number",
      g."checkInDate" as "checkInDate",
      g."checkOutDate" as "checkOutDate",
      mp."rent" as "rent",
      mp."lightBill" as "lightBill",
      mp."rentPaymentMethod" as "rentPaymentMethod",
      mp."lightBillPaymentMethod" as "lightBillPaymentMethod",
      g."deposit" as "deposit",
      r."name" as "roomName"
    FROM "monthlyPayment" mp
    LEFT JOIN "guest" g ON mp."guestId" = g."id"
    LEFT JOIN "room" r ON g."roomId" = r."id"
    WHERE
      mp."pgId" = $1 AND
      mp."isDeleted" = FALSE AND
      mp."month" = $2 AND
      mp."year" = $3;
  `;
  const params = [pgId, month, year];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
