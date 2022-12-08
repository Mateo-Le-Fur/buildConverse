const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

async function getNumberOfRooms(namespaceId) {
  const room = await client.query(
    `SELECT COUNT(id) FROM "room" WHERE namespace_id = ${namespaceId}`,
    { type: QueryTypes.SELECT }
  );

  return room[0];
}

module.exports = {
  getNumberOfRooms,
};
