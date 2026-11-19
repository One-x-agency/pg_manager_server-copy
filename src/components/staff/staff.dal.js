const { Parameter } = require('../../lib/queryBuilder');
const Vars = require('../../config/var');

// #region create
exports.create = async (dbClient, userId, pgId, data) => {
  const { name, phone, type, info, gender } = data;

  const query = `INSERT INTO
    staff
    ("name", "phone","pgId" ,"type" , "info",  "createdBy" , "createdAt" ,"gender")
    VALUES ($1, $2,$3, $4, $5,$6,$7,$8)
    RETURNING "name", "phone","pgId" , "type" ,"info", "id" , "gender"`;

  const params = [name, phone, pgId, type, info, userId, new Date().toISOString(), gender];

  const result = await dbClient.query(query, params);

  return result.rows[0];
};

// #endregion

// #region list

exports.list = async (dbClient, pgId) => {
  const query = `
      SELECT
        "id",
        "name",
        "phone",
        "type",
        "gender",
        "info"
      FROM "staff"
      WHERE
        "pgId" = $1 AND
        "isDeleted" = false
      GROUP BY
        "id";
    `;

  const params = [pgId];

  const result = await dbClient.query(query, params);

  return result.rows;
};
// #endregion

// #region getStaffById
exports.getStaffById = async (dbClient, pgId, staffId) => {
  const query = `
    SELECT
      stf."id",
      stf."name",
      stf."phone",
      stf."type",
      stf."gender",
      stf."info",
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', sd."id",
            'name', sd."name",
            'image', CONCAT('https://${Vars.aws.s3.bucket}.s3.${Vars.aws.region}.amazonaws.com/', sd."image")
          )
        ) FILTER (WHERE sd."id" IS NOT NULL), '[]'::json
      ) AS "documents"
    FROM "staff" stf
    LEFT JOIN "staffDocument" sd ON stf."id" = sd."staffId"
    WHERE
      stf."pgId" = $1 AND
      stf."isDeleted" = false AND
      stf."id" = $2
    GROUP BY
      stf."id";
  `;

  const params = [pgId, staffId];

  const result = await dbClient.query(query, params);

  return result.rows[0];
};
// #endregion

// #region update
exports.update = async (dbClient, userId, pgId, staffId, data) => {
  const pm = new Parameter();
  const fields = Object.keys(data);
  const setQuery = fields.map((field) => ` "${field}" = ${pm.i(data[field])} `);

  const sqlQuery = `
      UPDATE
        "staff"
      SET
        ${setQuery.join(',')},
        "updatedBy" = ${pm.i(userId)},
        "updatedAt" = ${pm.i(new Date().toISOString())}
      WHERE
        "pgId" = ${pm.i(pgId)} AND
        "id" = ${pm.i(staffId)}
      RETURNING  ${fields.map((v) => `"${v}"`).join(',')};
  `;

  const result = await dbClient.query(sqlQuery, pm.values);
  return result.rows[0];
};
// #endregion

// #region delete

// #region Delete

exports.delete = async (dbClient, pgId, userId, staffId) => {
  const sqlQuery = `
      UPDATE
        "staff"
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
  const params = [pgId, userId, staffId, currentTimeStamp];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};
// #endregion

// #region UploadDocument

exports.uploadDocument = async (dbClient, pgId, staffId, { name, image }) => {
  const sqlQuery = `
      INSERT INTO "staffDocument"
        (
          "pgId",
          "staffId",
          "name",
          "image"
        )
      VALUES ($1, $2, $3 ,$4)
      RETURNING
        "id",
        "name",
        "image";
    `;

  const params = [pgId, staffId, name, image];
  const result = await dbClient.query(sqlQuery, params);
  return result.rows[0];
};

// #endregion

// #region GetDocumentById

exports.getDocumentById = async (dbClient, pgId, documentId) => {
  const sqlQuery = `
      SELECT
        "id","image"
      FROM "staffDocument"
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
      DELETE FROM "staffDocument"
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
