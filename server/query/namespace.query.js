const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

async function getNumberOfUser(namespaceId) {
  const user = await client.query(
    `SELECT COUNT(id) FROM "user_has_namespace" WHERE namespace_id = ${namespaceId}`,
    { type: QueryTypes.SELECT }
  );

  return user[0];
}

module.exports = {
  getNumberOfUser,
};
