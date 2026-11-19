// #region create
exports.create = async (dbClient, pgId, userId, data) => {
  const {
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    checkInDate,
    tokenAmount,
    roomId,
    checkOutDate,
  } = data;

  const sqlQuery = `
        INSERT INTO "booking"
          (
            "pgId",
            "name",
            "email",
            "phone",
            "gender",
            "sharing",
            "rent",
            "checkInDate",
            "tokenAmount",
            "roomId",
            "checkOutDate",
            "createdBy"
          )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING
            "id",
            "pgId",
            "name",
            "email",
            "phone",
            "gender",
            "sharing",
            "rent",
            "checkInDate",
            "tokenAmount",
            "roomId",
            "checkOutDate";
  `;

  const params = [
    pgId,
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    checkInDate?.toISOString(),
    tokenAmount,
    roomId,
    checkOutDate?.toISOString(),
    userId,
  ];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region list
exports.list = async (dbClient, pgId, query) => {
  const isDeleted = query?.isDeleted ?? false;

  const sqlQuery = `
        SELECT
          b."id" AS "id",
          b."name" AS "name",
          b."gender" AS "gender",
          b."email" AS "email",
          b."rent" AS "rent",
          b."phone" AS "phone",
          b."sharing" AS "sharing",
          b."tokenAmount" AS "tokenAmount",
          b."checkInDate" AS "checkInDate",
          b."checkOutDate" AS "checkOutDate",
          COALESCE(
            json_build_object(
              'id', r."id",
              'name', r."name",
              'capacity', r."capacity"
            ), '{}'
          ) AS "room"
        FROM "booking" b
        LEFT JOIN "room" r ON b."roomId" = r."id"
        WHERE
          b."pgId" = $1 AND
          b."isDeleted" = $2;
      `;
  const params = [pgId, isDeleted];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};

// #endregion

// #region update
exports.update = async (dbClient, pgId, bookingId, userId, data) => {
  const {
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    checkInDate,
    tokenAmount,
    roomId,
    checkOutDate,
  } = data;

  const sqlQuery = `
      UPDATE "booking"
      SET
        "name" = $1,
        "email" = $2,
        "phone" = $3,
        "gender" = $4,
        "sharing" = $5,
        "rent" = $6,
        "checkInDate" = $7,
        "tokenAmount" = $8,
        "roomId" = $9,
        "checkOutDate" = $10,
        "updatedBy" = $11,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE
        "id" = $12 AND
        "pgId" = $13 AND
        "isDeleted" = FALSE;
    `;

  const params = [
    name,
    email,
    phone,
    gender,
    sharing,
    rent,
    checkInDate?.toISOString(),
    tokenAmount,
    roomId,
    checkOutDate?.toISOString(),
    userId,
    bookingId,
    pgId,
  ];

  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region delete
exports.delete = async (dbClient, pgId, userId, guestId) => {
  const sqlQuery = `
        UPDATE
          "booking"
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

// #region exportData
exports.exportData = async (dbClient, pgId, month, year) => {
  const startDate = new Date(year, month - 1, 1);

  const sqlQuery = `
      SELECT
        b."name",
        b."phone",
        b."checkInDate",
        b."checkOutDate",
        b."tokenAmount",
        b."rent",
        r."name" as "roomName"
      FROM "booking" b
      JOIN "room" r ON b."roomId" = r."id"
      WHERE
        b."pgId" = $1 AND
        b."isDeleted" = FALSE AND
        b."checkInDate" <= $2
      GROUP BY b."id", r."id";
    `;
  const params = [pgId, startDate];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
// #endregion
