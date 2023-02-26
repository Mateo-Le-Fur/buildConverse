import { Server } from "socket.io";
import { SocketCustom } from "../interfaces/SocketCustom";
import { Room, UserHasNamespace } from "../models";
import {
  getNumberOfUserNamespaces,
  getNumberOfUsers
} from "../query/namespace.query";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";

class SecurityManager {
  protected _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async checkIfUserIsAdminOfNamespace(
    socket: SocketCustom,
    authorizations: AuthorizationsInterface,
    namespaceId: number
  ) {
    const userId = socket.request.user?.id;

    if (!socket.rooms.has(`server-${namespaceId}`)) throw new Error("Forbidden");

    if (!authorizations.adminServer.has(namespaceId)) {
      const check = await UserHasNamespace.findOne({
        where: { userId, namespaceId, admin: true }
      });
      if (!check) throw new Error("Tu dois être administrateur");
      authorizations.adminServer.add(namespaceId);
    }
  }

  public checkIfNamespaceIsInit(namespaceId: number) {
    return this._ios._nsps.get(`/${namespaceId}`);
  }

  public async checkIfUserAlreadyHasTheServer(
    socket: SocketCustom,
    userId: number | undefined
  ) {
    if (!userId) return;

    const namespaceId = Number(socket.nsp.name.substring(1));

    const check = await UserHasNamespace.findOne({
      where: {
        userId,
        namespaceId
      }
    });

    if (check) throw new Error("Tu as déjà rejoint ce serveur");
  }

  public async checkIfServerIsFull(socket: SocketCustom, limit: number) {
    const namespaceId = Number(socket.nsp.name.substring(1));
    let { count } = await getNumberOfUsers(namespaceId);
    const checkIfServerIsFull = count >= limit;

    if (checkIfServerIsFull) throw new Error("Le serveur est plein");
  }

  public async checkUserNamespacesLimit(
    userId: number | undefined,
    limit: number
  ) {
    if (!userId) return;

    const { count: namespacesLimit } = await getNumberOfUserNamespaces(userId);

    if (namespacesLimit >= limit) {
      throw new Error(
        `Tu ne peut pas créer/rejoindre plus de ${limit} serveur`
      );
    }
  }

  public async isAllowedToJoinRoom(
    socket: SocketCustom,
    authorizations: AuthorizationsInterface,
    data: { roomId: number; namespaceId: number }
  ) {
    const { roomId, namespaceId } = data;

    if (!socket.rooms.has(`server-${namespaceId}`))
      throw new Error("Forbidden");

    if (!authorizations.room.has(data.roomId)) {
      const foundNamespaceRoom = await Room.findOne({
        where: { id: roomId, namespaceId }
      });
      if (!foundNamespaceRoom) throw new Error("Forbidden");
      authorizations.room.add(data.roomId);
    }
  }

  async checkIfRoomBelongsToNamespace(authorizations: AuthorizationsInterface, namespaceId: number, roomId: number) {
    const isRoomBelongsToNamespace = authorizations.namespaceHasRooms.get(namespaceId)?.has(roomId);

    if (!isRoomBelongsToNamespace) {
      const foundNamespaceRoom = await Room.findOne({
        where: { id: roomId, namespaceId }
      });
      if (!foundNamespaceRoom) throw new Error("Forbidden");
      const rooms = authorizations.namespaceHasRooms.get(namespaceId);
      rooms?.add(roomId);
    }
  }
}

export { SecurityManager };
