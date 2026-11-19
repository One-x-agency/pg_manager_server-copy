exports.analytics = async (dbClient, pgId) => {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

  const sqlStmt = `
    WITH "oldGuestAndRentCount" AS (
      SELECT
        COUNT(1)::INTEGER AS "guestCount",
        SUM("rent")::INTEGER AS "rent"
      FROM "guest"
      WHERE
        "pgId" = $1 AND
        "isDeleted" = FALSE AND
        "checkInDate" < $2
    ),
    "newGuestAndRentCount" AS (
      SELECT
        COUNT(1)::INTEGER AS "guestCount",
        SUM(mp."rent")::INTEGER AS "rent"
      FROM "guest" g
      LEFT JOIN "monthlyPayment" mp ON
        mp."guestId" = g."id" AND
        mp."isDeleted" = FALSE AND
        mp."month" = $3 AND
        mp."year" = $4
      WHERE
        g."pgId" = $1 AND
        g."isDeleted" = FALSE AND
        g."checkInDate" >= $2
    ),
    "rentCollection" AS (
      SELECT
        SUM(mp."rent")::INTEGER AS "rent"
      FROM "guest" g
      LEFT JOIN "monthlyPayment" mp ON
        mp."guestId" = g."id" AND
        mp."isDeleted" = FALSE AND
        mp."month" = $3 AND
        mp."year" = $4
      WHERE
        g."pgId" = $1 AND
        g."isDeleted" = FALSE
    ),
    "lightBillCollection" AS (
      SELECT
        SUM(mp."lightBill")::INTEGER AS "lightBill"
      FROM "guest" g
      LEFT JOIN "monthlyPayment" mp ON
        mp."guestId" = g."id" AND
        mp."isDeleted" = FALSE AND
        mp."month" = $3 AND
        mp."year" = $4
      WHERE
        g."pgId" = $1 AND
        g."isDeleted" = FALSE
    ),
    "roomData" AS (
      SELECT
        COUNT(1)::INTEGER AS "roomCount",
        SUM(r."capacity")::INTEGER AS "totalCapacity",
        SUM(lbh."amount")::INTEGER AS "estimatedLightBill"
      FROM "room" r
      LEFT JOIN "roomLightBillHistory" lbh ON
        lbh."roomId" = r."id" AND
        lbh."isDeleted" = FALSE AND
        lbh."month" = $5 AND
        lbh."year" = $6
      WHERE
        r."pgId" = $1 AND
        r."isDeleted" = FALSE
    ),
    "inquiryData" AS (
      SELECT
        COUNT(1)::INTEGER AS "inquiryCount"
      FROM "inquiry" inq
      WHERE
        inq."pgId" = $1 AND
        inq."isDeleted" = FALSE
    ),
    "bookingData" AS (
      SELECT
        COUNT(1)::INTEGER AS "bookingCount"
      FROM "booking" b
      WHERE
        b."pgId" = $1 AND
        b."isDeleted" = FALSE
    )
    SELECT
      "bookingData"."bookingCount" AS "bookingCount",
      "roomData"."roomCount" AS "roomCount",
      "inquiryData"."inquiryCount" AS "inquiryCount",
      "roomData"."totalCapacity" AS "totalCapacity",
      ("oldGuestAndRentCount"."guestCount" + "newGuestAndRentCount"."guestCount") AS "guestCount",
      (COALESCE("oldGuestAndRentCount"."rent", 0) + COALESCE("newGuestAndRentCount"."rent", 0)) AS "estimatedRent",
      COALESCE("roomData"."estimatedLightBill",0) AS "estimatedLightBill",
      COALESCE("rentCollection"."rent",0) AS "rentCollection",
      COALESCE("lightBillCollection"."lightBill",0) AS "lightBillCollection"
    FROM
      "bookingData",
      "inquiryData",
      "oldGuestAndRentCount",
      "newGuestAndRentCount",
      "rentCollection",
      "lightBillCollection",
      "roomData";
  `;
  const params = [
    pgId,
    currentMonth.toISOString(),
    currentMonth.getMonth(),
    currentMonth.getFullYear(),
    previousMonthDate.getMonth(),
    previousMonthDate.getFullYear(),
  ];
  const result = await dbClient.query(sqlStmt, params);
  return result.rows[0];
};
