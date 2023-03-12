import { Server } from "socket.io";
import {
  DeleteUserInterface,
  SocketCustom,
  UpdateUserInterface
} from "../interfaces";

import { UserManager } from "../sockets/user.socket";
import userValidator from "../validation/schema/user.schema";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";
import { SecurityManager } from "../sockets/security.socket";
import listenerHandler from "../helpers/listenerHandler";
import { Acknowledgment } from "../interfaces/Acknowledgment";

class UserListener {
  protected _ios: Server;
  protected _socket: SocketCustom;
  private _authorizations: AuthorizationsInterface;
  private _securityManager: SecurityManager;
  private _userManager: UserManager;

  constructor(
    { socket, ios, authorizations, securityManager }: {
      socket: SocketCustom;
      ios: Server;
      authorizations: AuthorizationsInterface;
      securityManager: SecurityManager;
    }, userManager: UserManager
  ) {
    this._ios = ios;
    this._socket = socket;
    this._authorizations = authorizations;
    this._securityManager = securityManager;
    this._userManager = userManager;

    this.updateUserListener();
    this.deleteUserListener();
  }

  updateUserListener() {
    this._socket.on(
      "updateUser",
      listenerHandler(async (data: UpdateUserInterface, callback: Acknowledgment) => {
          await userValidator.validateAsync(data);
          await this._userManager.updateUser(this._socket, data);
          callback({
            status: "ok",
            message: ""
          });
        }
      ));
  }

  deleteUserListener() {
    this._socket.on("deleteUser", async (data: DeleteUserInterface) => {
      try {
        await this._userManager.deleteUser(this._socket, data);
      } catch (e) {
        console.error(e);
      }
    });
  }

  async disconnect(socket: SocketCustom, clients: Map<number, string>) {
    const { id } = socket.request.user!;

    if (id) clients.delete(id);

    await this._userManager.disconnectUser(this._socket);

  }
}

export { UserListener };
