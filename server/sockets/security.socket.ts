import { Server, Namespace } from "socket.io";
import { SocketCustom } from "../interfaces/SocketCustom";
import { Room, User, UserHasNamespace, UserNamespace } from "../models";
import {
  getNumberOfUserNamespaces,
  getNumberOfUsers,
} from "../query/namespace.query";
import { RoomInterface } from "../interfaces";
import { ExtendedError } from "socket.io/dist/namespace";

class SecurityManager {
  protected _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async checkIfUserHasNamespace(ns: Namespace) {
    ns.use(
      async (
        socket: SocketCustom,
        next: (err?: ExtendedError | undefined) => void
      ) => {
        try {
          const userId = socket.request.user?.id;

          const namespaceId = Number(socket.nsp.name.substring(1));

          const foundUserNamespace = await UserNamespace.findByPk(namespaceId, {
            attributes: [],
            include: {
              model: User,
              as: "users",
              attributes: { exclude: ["password"] },
              where: {
                id: userId,
              },
            },
          });

          if (foundUserNamespace) {
            this._ios
              .of(socket.nsp.name)
              .emit("userConnect", foundUserNamespace?.users);

            return next();
          }
          next(new Error("Tu n'as pas accès à ce serveur "));
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  public async checkIfUserIsAdminOfNamespace(socket: SocketCustom) {
    const userId = socket.request.user?.id;

    const namespaceId = Number(socket.nsp.name.substring(1));

    const check = await UserHasNamespace.findOne({
      where: {
        userId,
        namespaceId,
        admin: true,
      },
      raw: true,
    });

    if (!check) throw new Error("Tu dois être administrateur");
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
        namespaceId,
      },
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

  public async isAllowedToRetrieveMessages(
    nsSocket: SocketCustom,
    data: Partial<RoomInterface>
  ) {
    const { roomId } = data;

    const namespaceId = Number(nsSocket.nsp.name.substring(1));

    const foundNamespaceRoom = await Room.findOne({
      where: {
        id: roomId,
        namespaceId,
      },
    });

    if (!foundNamespaceRoom) throw new Error("forbidden");
  }
}

export { SecurityManager };
