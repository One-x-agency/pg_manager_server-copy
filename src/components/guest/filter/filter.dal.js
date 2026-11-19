exports.getViewData = async (dbClient, month, year, pgId) => {
  const sqlQuery = `
    SELECT
      g."id" as "id",
      g."name" as "name",
      g."phone" as "phone",
      g."sharing" as "sharing",
      g."rent" as "rent",
      g."meta" as "meta",
      JSON_BUILD_OBJECT(
        'id', r."id",
        'name', r."name",
        'capacity', r."capacity"
      ) as "room",
      JSON_BUILD_OBJECT(
        'month', $1,
        'year', $2,
        'rent', mp."rent",
        'lightBill', mp."lightBill",
        'date', mp."date",
        'rentPaymentMethod', mp."rentPaymentMethod",
        'lightBillPaymentMethod', mp."lightBillPaymentMethod",
        'remark', mp."remark"
      ) as "monthlyPayment",
      JSON_BUILD_OBJECT(
        'type', 'monthlyPayment',
        'reference', CONCAT(g."id",'-',$1,'-',$2),
        'date', rem."date",
        'description', rem."description"
      ) as "reminder"
    FROM "guest" g
    LEFT JOIN "room" r ON g."roomId" = r."id"
    LEFT JOIN "monthlyPayment" mp ON
      g."id" = mp."guestId" AND
      mp."isDeleted" = FALSE AND
      mp."month" = $1 AND
      mp."year" = $2
    LEFT JOIN "reminder" rem ON
      rem."reference" = CONCAT(g."id",'-',$1,'-',$2) AND
      rem."isDeleted" = FALSE AND
      rem."type" = 'monthlyPayment'
    WHERE
      g."checkInDate" < $4 AND
      g."isDeleted" = FALSE AND
      g."pgId" = $3;
  `;

  const params = [month, year, pgId, new Date(year, month + 1, 1).toISOString()];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows;
};
