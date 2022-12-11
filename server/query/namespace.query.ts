const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

async function getNumberOfUsers(
  namespaceId: number
): Promise<{ count: number }> {
  const user: [{ count: number }] = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE namespace_id = ${namespaceId}`,
    { type: QueryTypes.SELECT }
  );

  return user[0];
}

async function getNumberOfUserNamespaces(
  userId: number
): Promise<{ count: number }> {
  const namespaces: [{ count: number }] = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE user_id = ${userId}`,
    { type: QueryTypes.SELECT }
  );

  return namespaces[0];
}

export { getNumberOfUsers, getNumberOfUserNamespaces };
