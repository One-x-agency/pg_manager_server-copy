// #region create
exports.create = async (dbClient, pgId, userId, data) => {
  const { amount, date, category, description, paymentMethod, sender, receiver } = data;
  const sql = `
  INSERT INTO "expense" ("pgId", "amount", "date", "category", "description" , "paymentMethod" , "sender" , "receiver" , "createdAt" , "createdBy" )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9 , $10)
  RETURNING "amount":: FLOAT, "date", "category", "description" , "paymentMethod" , "sender" , "receiver" ,"id";
  `;

  const values = [pgId, amount, date, category, description, paymentMethod, sender, receiver, new Date().toISOString(), userId];
  const result = await dbClient.query(sql, values);
  return result.rows[0];
};

// #endregion

// #region list
exports.list = async (dbClient, pgId) => {
  const sql = `
  SELECT
  "amount":: FLOAT, "date", "category", "description" , "paymentMethod" , "sender" , "receiver" ,"id"
  FROM
  "expense"
  WHERE
  "pgId" = $1 AND
  "isDeleted" =false
  ;
  `;
  const values = [pgId];
  const result = await dbClient.query(sql, values);
  return result.rows;
};
// #endregion

// #region update
exports.update = async (dbClient, pgId, userId, expenseId, data) => {
  const { amount, date, category, description, paymentMethod, sender, receiver } = data;
  const sql = `
  UPDATE "expense"
  SET
  "amount" = $1,
  "date" = $2,
  "category" = $3,
  "description" = $4,
  "paymentMethod" = $5,
  "sender" = $6,
  "receiver" = $7,
  "updatedAt" = $8,
  "updatedBy" = $9
  WHERE
  "pgId" = $10 AND
  "id" = $11
  RETURNING *;
  `;
  const values = [amount, date, category, description, paymentMethod, sender, receiver, new Date().toISOString(), userId, pgId, expenseId];
  await dbClient.query(sql, values);
};
// #endregion

// #region delete
exports.delete = async (dbClient, pgId, userId, expenseId) => {
  const sql = `
  UPDATE "expense"
  SET
  "isDeleted" = true,
  "deletedAt" = $1,
  "deletedBy" = $2
  WHERE
  "pgId" = $3 AND
  "id" = $4
  RETURNING *;
  `;
  const values = [new Date().toISOString(), userId, pgId, expenseId];
  const result = await dbClient.query(sql, values);
  return result.rows[0];
};
// #endregion

// #region exportData

// need total amount of expense group by category
// Expense data query
exports.expenseData = async (dbClient, pgId, month, year) => {
  const sql = `
  SELECT
    "category",
    "paymentMethod",
    SUM("amount") AS "totalAmount"
  FROM
      "expense"
  WHERE
  "pgId" = $1 AND
  EXTRACT(MONTH FROM "date") = $2 AND
  EXTRACT(YEAR FROM "date") = $3 AND
  "isDeleted" = false
  GROUP BY
    "category",
    "paymentMethod";
  `;
  const values = [pgId, month, year];
  const result = await dbClient.query(sql, values);
  return result.rows;
};

// Income data from the monthlyPayment rent
exports.incomeData = async (dbClient, pgId, month, year) => {
  const sql = `
  SELECT
    SUM(CASE WHEN "rentPaymentMethod" = 'cash' THEN "rent" ELSE 0 END) AS "totalRentCash",
    SUM(CASE WHEN "rentPaymentMethod" = 'online' THEN "rent" ELSE 0 END) AS "totalRentOnline",
    SUM(CASE WHEN "lightBillPaymentMethod" = 'cash' THEN "lightBill" ELSE 0 END) AS "totalLightBillCash",
    SUM(CASE WHEN "lightBillPaymentMethod" = 'online' THEN "lightBill" ELSE 0 END) AS "totalLightBillOnline"
  FROM
      "monthlyPayment"
  WHERE
    "pgId" = $1 AND
    EXTRACT(MONTH FROM "date") = $2 AND
    EXTRACT(YEAR FROM "date") = $3 AND
    "isDeleted" = false;
`;

  const values = [pgId, month, year];
  const result = await dbClient.query(sql, values);
  return result.rows;
};

// #endregion
