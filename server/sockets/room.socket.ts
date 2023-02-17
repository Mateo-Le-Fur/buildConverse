import { Server, Socket } from "socket.io";
import { MessageInterface, RoomInterface, SocketCustom } from "../interfaces";
import { Room, Message } from "../models";
import { getNumberOfRooms } from "../query/room.query";

class RoomsManager {
  protected _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async joinRoom(nsSocket: SocketCustom, data: RoomInterface) {
    nsSocket.join(`/${data.roomId}`);
    await this.getMessages(nsSocket, data.roomId);
  }

  public async leaveRoom(nsSocket: Socket, roomId: number) {
    nsSocket.leave(`/${roomId}`);
  }

  public async getMessages(
    nsSocket: Socket,
    roomId: number,
    isBeginningConversation?: boolean
  ) {
    let messages = (
      await Message.findAll({
        where: {
          roomId: roomId,
        },
        order: [["id", "desc"]],
        limit: 100,
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

    nsSocket.emit("history", messages);
  }
  public async loadMoreMessage(
    nsSocket: SocketCustom,
    data: {
      id: number;
      messagesArrayLength: number;
      isBeginningConversation: boolean;
    }
  ) {
    if (data.messagesArrayLength < 0) return;

    if (data.isBeginningConversation) {
      const messages = await this.getMessages(
        nsSocket,
        data.id,
        data.isBeginningConversation
      );

      nsSocket.emit("loadMoreMessages", messages);

      return;
    }

    let messages = (
      await Message.findAll({
        where: {
          roomId: data.id,
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
          message.userId
        }/${Date.now()}/avatar`,
      };
    });

    nsSocket.emit("loadMoreMessages", messages);
  }

  public async createRoom(data: RoomInterface) {
    const room = await Room.create({
      name: `# ${data.name}`,
      namespaceId: data.namespaceId,
    });

    this._ios.of(`/${data.namespaceId}`).emit("createRoom", room);
  }

  public async updateRoom(nsSocket: SocketCustom, data: RoomInterface) {
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
