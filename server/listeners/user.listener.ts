import { Server } from "socket.io";
import {
  DeleteUserInterface,
  SocketCustom,
  UpdateUserInterface,
} from "../interfaces";

import { UserManager } from "../sockets/user.socket";
import userValidator from "../validation/schema/user.schema";
class UserListener extends UserManager {
  protected _ios: Server;
  protected _socket: SocketCustom;
  protected _clients: Map<number, string>;
  constructor(socket: SocketCustom, ios: Server, clients: Map<number, string>) {
    super(ios, clients);
    this._ios = ios;
    this._clients = clients;
    this._socket = socket;

    this.updateUserListener();
    this.deleteUserListener();
    this.disconnectListener();
  }

  updateUserListener() {
    this._socket.on(
      "updateUser",
      async (data: UpdateUserInterface, callback) => {
        try {
          await userValidator.validateAsync(data);

          await this.updateUser(this._socket, data);
          callback({
            status: "ok",
          });
        } catch (e) {
          if (e instanceof Error) {
            callback({
              status: "error",
              message: e.message,
            });
          }
        }
      }
    );
  }
  deleteUserListener() {
    this._socket.on("deleteUser", async (data: DeleteUserInterface) => {
      try {
        await this.deleteUser(this._socket, data);
      } catch (e) {
        console.error(e);
      }
    });
  }

  disconnectListener() {
    this._socket.on("disconnect", async () => {
      const { id } = this._socket.request.user!;

      if (id) this._clients.delete(id);

      await this.disconnectUser(this._socket);

      console.log("disconnect home");
    });
  }
}

export { UserListener };
