import { Server, Socket } from "socket.io";
import { MessageInterface } from "../interfaces/Message";
import { RoomInterface } from "../interfaces/Room";
import { Namespace } from "socket.io/dist/namespace";
import { Room, Message, UserHasNamespace } from "../models";
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
        namespaceId: namespaceId,
      },
      order: [["created_at", "asc"]],
    });

    nsSocket.emit("rooms", getRooms);
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

  public async getMessages(nsSocket: Socket, roomId: number) {
    let messages = (
      await Message.findAll({
        where: {
          roomId: roomId,
        },
        order: [["id", "desc"]],
        limit: 50,
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

    nsSocket.emit("history", messages);
  }
  public async loadMoreMessage(
    socket: SocketCustom,
    data: { id: number; messagesArrayLength: number }
  ) {
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
