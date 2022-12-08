import { Socket } from "socket.io";
import { MessageInterface } from "../interfaces/Message";
import { RoomInterface } from "../interfaces/Room";

const { Room, Message } = require("../models");
const { getNumberOfRooms } = require("../query/room.query");

const rooms = {
  async getAllRooms(nsSocket: Socket, namespaceId: string) {
    const getRooms = await Room.findAll({
      where: {
        namespace_id: namespaceId,
      },
      order: [["created_at", "asc"]],
    });

    nsSocket.emit("rooms", getRooms);
  },

  async getAllMessages(nsSocket: Socket, roomId: number) {
    let messages = await Message.findAll({
      where: {
        room_id: roomId,
      },
      order: [["created_at", "asc"]],
      raw: true,
      nest: true,
    });

    messages = messages.map((message: MessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.user_id
        }/${Date.now()}/avatar`,
      };
    });

    nsSocket.emit("history", messages);
  },

  async createRoom(ios: Socket, data: RoomInterface) {
    const room = await Room.create({
      name: data.name,
      index: data.index,
      namespace_id: data.namespaceId,
    });

    ios.of(`/${data.namespaceId}`).emit("createRoom", room);
  },

  async updateRoom(ios: Socket, data: {id: number, namespaceId: number, name: string}) {
    const { id, namespaceId, name } = data;

    await Room.update(
      {
        name,
      },
      {
        where: {
          id,
        },
      }
    );

    ios.of(`/${namespaceId}`).emit("updateRoom", data);
  },

  async deleteRoom(ios: Socket, nsSocket: Socket, data: {id: number, namespaceId: number}) {
    const { id, namespaceId } = data;

    const { count } = await getNumberOfRooms(namespaceId);

    if (count > 1) {
      await Room.destroy({
        where: {
          id,
        },
      });
    }

    nsSocket.leave(`/${id}`);

    ios.of(`/${namespaceId}`).emit("deleteRoom", data);
  },
};

export default rooms;
