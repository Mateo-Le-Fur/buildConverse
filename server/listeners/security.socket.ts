import { Server } from "socket.io";
import { SocketCustom } from "../interfaces/SocketCustom";
import { UserHasNamespace } from "../models";

class SecurityManager {
  private _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
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
}

export { SecurityManager };
