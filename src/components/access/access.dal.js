const Vars = require('../../config/var');

exports.getGuestById = async (dbClient, pgId, guestId) => {
  const sqlQuery = `
    SELECT
      g."id",
      g."name",
      g."email",
      g."phone",
      g."gender",
      g."emergencyPhone",
      g."address",
      case
        when g."profileImage" is not null
        then
          concat('https://${Vars.aws.s3.bucket}.s3.${Vars.aws.region}.amazonaws.com/',g."profileImage")
        else
          g."profileImage"
      end AS "profileImage",
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', gd."id",
            'name', gd."name",
            'image', CONCAT('https://${Vars.aws.s3.bucket}.s3.${Vars.aws.region}.amazonaws.com/', gd."image")
          )
        ) FILTER (WHERE gd."id" IS NOT NULL), '[]'
      ) as "documents"
    FROM "guest" g
    LEFT JOIN "guestDocument" gd ON g."id" = gd."guestId"
    WHERE
      g."pgId" = $1 AND
      g."isDeleted" = FALSE AND
      g."id" = $2
    GROUP BY g."id";
  `;

  const result = await dbClient.query(sqlQuery, [pgId, guestId]);
  return result.rows[0];
};

exports.updateGuestInfo = async (dbClient, pgId, guestId, data) => {
  const { email, emergencyPhone, address, profileImage } = data;

  const sqlQuery = `
      UPDATE "guest"
      SET
        "email" = $3,
        "emergencyPhone" = $4,
        "address" = $5,
        "profileImage" = $6
      WHERE
        "pgId" = $1
        AND "id" = $2
        AND "isDeleted" = false
      RETURNING
        "id",
        "name",
        "phone",
        "email",
        "emergencyPhone",
        "address";
    `;

  const params = [
    pgId,
    guestId,
    email,
    emergencyPhone,
    address,
    profileImage,
  ];

  const result = await dbClient.query(sqlQuery, params);

  return result.rows[0];
};
