import { Server } from "socket.io";
import { SocketCustom } from "../interfaces/SocketCustom";
import { User, UserHasNamespace, UserNamespace } from "../models";
import {
  getNumberOfUserNamespaces,
  getNumberOfUsers,
} from "../query/namespace.query";

class SecurityManager {
  private _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async checkIfUserHasNamespace(
    socket: SocketCustom,
    namespaceId: number
  ): Promise<UserNamespace | null> {
    const userId = socket.request.user?.id;

    return await UserNamespace.findByPk(namespaceId, {
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
  }

  public async checkIfUserIsAdminOfNamespace(
    socket: SocketCustom,
    namespaceId: number
  ) {
    const userId = socket.request.user?.id;

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
    userId: number | undefined,
    namespaceId: number
  ) {
    if (!userId) return;

    const check = await UserHasNamespace.findOne({
      where: {
        userId,
        namespaceId,
      },
    });

    if (check) throw new Error("Tu as déjà rejoint ce serveur");
  }

  public async checkIfServerIsFull(namespaceId: number, limit: number) {
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
}

export { SecurityManager };
