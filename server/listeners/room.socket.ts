import { Server, Socket } from "socket.io";
import { MessageInterface, RoomInterface, SocketCustom } from "../interfaces";
import { Namespace } from "socket.io/dist/namespace";
import { Room, Message, UserHasNamespace } from "../models";
import { getNumberOfRooms } from "../query/room.query";

class RoomsManager {
  private _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async joinRoom(nsSocket: SocketCustom, data: RoomInterface) {
    const userId = nsSocket.request.user?.id;

    const { namespaceId, roomId } = data;

    const foundUserNamespace = await UserHasNamespace.findOne({
      where: {
        userId,
        namespaceId,
      },
    });

    if (!foundUserNamespace) throw new Error("forbidden");

    const foundNamespaceRoom = await Room.findOne({
      where: {
        id: roomId,
        namespaceId: foundUserNamespace.namespaceId,
      },
    });

    if (!foundNamespaceRoom) throw new Error("forbidden");

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
    socket: SocketCustom,
    data: {
      id: number;
      messagesArrayLength: number;
      isBeginningConversation: boolean;
    }
  ) {
    console.log(data);

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

    socket.emit("loadMoreMessages", messages);
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

    const t0 = performance.now();

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

    const t1 = performance.now();

    console.log(t1 - t0 + " switch");

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
