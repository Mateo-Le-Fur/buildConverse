import { Server, Socket } from "socket.io";
import { MessageInterface, RoomInterface, SocketCustom } from "../interfaces";
import { Room, Message } from "../models";
import { getNumberOfRooms } from "../query/room.query";

class RoomsManager {
  protected _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async joinRoom(socket: SocketCustom, roomId: number) {
    socket.join(`room-${roomId}`);
    await this.getMessages(socket, roomId);
  }

  public async leaveRoom(socket: Socket, roomId: number) {
    socket.leave(`room-${roomId}`);
  }

  public async getMessages(
    socket: Socket,
    roomId: number,
    isBeginningConversation?: boolean
  ) {
    let messages = (
      await Message.findAll({
        where: {
          roomId: roomId,
        },
        order: [["id", "desc"]],
        limit: 40,
      })
    ).map((el: Message) => el.toJSON());

    messages = messages.map((message: MessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.userId
        }/${Date.now()}/avatar`,
      };
    });

    if (isBeginningConversation) return messages;

    socket.emit("history", messages);
  }
  public async loadMoreMessage(
    socket: SocketCustom,
    data: {
      id: number;
      messagesArrayLength: number;
      isBeginningConversation: boolean;
    }
  ) {
    if (data.messagesArrayLength < 0) return;

    if (data.isBeginningConversation) {
      const messages = await this.getMessages(
        socket,
        data.id,
        data.isBeginningConversation
      );

      socket.emit("loadMoreMessages", messages);

      return;
    }

    let messages = (
      await Message.findAll({
        where: {
          roomId: data.id,
        },
        order: [["id", "desc"]],
        limit: 20,
        offset: data.messagesArrayLength,
      })
    ).map((el: Message) => el.toJSON());

    messages = messages.map((message: MessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.userId
        }/${Date.now()}/avatar`,
      };
    });

    socket.emit("loadMoreMessages", messages);
  }

  public async createRoom(data: RoomInterface) {
    const room = await Room.create({
      name: `# ${data.name}`,
      namespaceId: data.namespaceId,
    });

    this._ios.to(`server-${data.namespaceId}`).emit("createRoom", room);
  }

  public async updateRoom(socket: SocketCustom, data: RoomInterface) {
    const { id, namespaceId, name, index } = data;

    await Room.update(
      {
        name,
        index,
      },
      {
        where: {
          id,
        },
      }
    );

    this._ios.to(`server-${namespaceId}`).emit("updateRoom", data);
  }

  public async deleteRoom(
    socket: Socket,
    data: { id: number; namespaceId: number }
  ) {
    const { id, namespaceId } = data;

    const { count } = await getNumberOfRooms(namespaceId);

    if (count > 1) {
      await Room.destroy({
        where: {
          id: id,
        },
      });
    }

    socket.leave(`room-${id}`);

    this._ios.to(`server-${namespaceId}`).emit("deleteRoom", data);
  }
}

export { RoomsManager };
