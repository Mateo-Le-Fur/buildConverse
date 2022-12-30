import { Server, Socket } from "socket.io";
import { MessageInterface } from "../interfaces/Message";
import { RoomInterface } from "../interfaces/Room";
import { Namespace } from "socket.io/dist/namespace";

import { Room, Message } from "../models";
import { getNumberOfRooms } from "../query/room.query";
import { SocketCustom } from "../interfaces/SocketCustom";

class RoomsManager {
  private _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async getAllRooms(nsSocket: Socket, namespaceId: string) {
    const getRooms = await Room.findAll({
      where: {
        namespace_id: namespaceId,
      },
      order: [["created_at", "asc"]],
    });

    nsSocket.emit("rooms", getRooms);
  }

  public async getMessages(nsSocket: Socket, roomId: number) {
    let messages = (
      await Message.findAll({
        where: {
          room_id: roomId,
        },
        order: [["id", "desc"]],
        limit: 50,
      })
    ).map((el: Message) => el.toJSON());

    messages = messages.map((message: MessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.user_id
        }/${Date.now()}/avatar`,
      };
    });

    nsSocket.emit("history", messages);
  }
  public async loadMoreMessage(
    socket: SocketCustom,
    data: { id: number; messagesArrayLength: number }
  ) {
    let messages = (
      await Message.findAll({
        where: {
          room_id: data.id,
        },
        order: [["id", "desc"]],
        limit: 50,
        offset: data.messagesArrayLength,
      })
    ).map((el: Message) => el.toJSON());

    messages = messages.map((message: MessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.user_id
        }/${Date.now()}/avatar`,
      };
    });

    socket.emit("loadMoreMessages", messages);
  }

  public async createRoom(data: RoomInterface) {
    const room = await Room.create({
      name: `# ${data.name}`,
      index: data.index,
      namespace_id: data.namespaceId,
    });

    this._ios.of(`/${data.namespaceId}`).emit("createRoom", room);
  }

  public async updateRoom(data: {
    id: number;
    namespaceId: number;
    name: string;
  }) {
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

    this._ios.of(`/${namespaceId}`).emit("updateRoom", data);
  }

  public async deleteRoom(
    nsSocket: Socket,
    data: { id: number; namespaceId: number }
  ) {
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

    this._ios.of(`${namespaceId}`).emit("deleteRoom", data);
  }
}

export { RoomsManager };
