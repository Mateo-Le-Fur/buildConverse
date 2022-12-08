const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

async function getNumberOfUser(
  namespaceId: number
): Promise<{ count: number }> {
  const user: [{ count: number }] = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE namespace_id = ${namespaceId}`,
    { type: QueryTypes.SELECT }
  );

  return user[0];
}

export { getNumberOfUser };
