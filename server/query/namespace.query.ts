const client = require("../config/sequelize");
const {QueryTypes} = require("sequelize");

async function getNumberOfUsers(
  namespaceId: number
): Promise<{ count: number }> {
  const user: [{ count: number }] = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE namespace_id = :id`,
    {replacements: {id: namespaceId}, type: QueryTypes.SELECT}
  );

  return user[0];
}

async function getNumberOfUserNamespaces(
  userId: number | undefined
): Promise<{ count: number }> {
  const namespaces: [{ count: number }] = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE user_id = :id`,
    {replacements: {id: userId}, type: QueryTypes.SELECT}
  );

  return namespaces[0];
}

async function getNumberOfUsersConnected(
  namespaceId: number | undefined
): Promise<number > {
  const namespaces: [{ count: number }] = await client.query(
    `SELECT count(*) FROM "user" AS "u"
         INNER JOIN "user_has_namespace" AS "uhs"  ON "uhs"."user_id" = "u"."id"
         WHERE "u"."status" = 'online' AND "uhs"."namespace_id" = :id`,
    {replacements: {id: namespaceId}, type: QueryTypes.SELECT}
  );
  return namespaces[0].count;
}

export {getNumberOfUsers, getNumberOfUserNamespaces, getNumberOfUsersConnected};
