import client from "../config/sequelize";
import { QueryTypes } from "sequelize";

async function getNumberOfRooms(
  namespaceId: number
): Promise<{ count: number }> {
  const room: { count: number }[] = await client.query(
    `SELECT COUNT(id) FROM "room" WHERE namespace_id = :id`,
    { replacements: { id: namespaceId }, type: QueryTypes.SELECT }
  );

  return room[0];
}

export { getNumberOfRooms };
