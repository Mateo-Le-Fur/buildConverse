import { Server } from "socket.io";
import { NamespaceInterface, SocketCustom } from "../interfaces";
import { NamespacesManager } from "../sockets/namespace.socket";
import { SecurityManager } from "../sockets/security.socket";
import { UserNamespace } from "../models";
import namespaceValidator from "../validation/schema/namespace.schema";
import joinNamespaceValidator from "../validation/schema/joinNamespace.schema";
class NamespaceListener extends NamespacesManager {
  protected _ios: Server;
  protected _socket: SocketCustom;
  protected _securityManager: SecurityManager;
  constructor(socket: SocketCustom, ios: Server, clients: Map<number, string>) {
    super(ios, clients);
    this._securityManager = new SecurityManager(ios);
    this._ios = ios;
    this._socket = socket;

    this.createNamespaceListener();
    this.userJoinNamespaceListener();
  }

  async onConnect() {
    await this.getUserNamespaces(this._socket);
  }

  createNamespaceListener() {
    this._socket.on(
      "createNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          const userId = this._socket.request.user?.id;
          await this._securityManager.checkUserNamespacesLimit(
            userId,
            this.userNamespacesLimit
          );
          await namespaceValidator.validateAsync(data);
          await this.createNamespace(this._socket, data);
          callback({
            status: "ok",
            message: "",
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
  userJoinNamespaceListener() {
    this._socket.on(
      "userJoinNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          const userId = this._socket.request.user?.id;

          const namespace = await UserNamespace.findOne({
            where: { inviteCode: data.inviteCode },
            raw: true,
          });

          if (namespace) {
            await joinNamespaceValidator.validateAsync(data);
            await this._securityManager.checkIfUserAlreadyHasTheServer(
              this._socket,
              userId
            );
            await this._securityManager.checkUserNamespacesLimit(
              userId,
              this.userLimit
            );
            await this._securityManager.checkIfServerIsFull(
              this._socket,
              this.userLimit
            );
            await this.joinInvitation(this._socket, data);
          }

          callback({
            status: "ok",
          });
        } catch (e) {
          if (e instanceof Error) {
            console.error(e);
            callback({
              status: "error",
              message: e.message,
            });
          }
        }
      }
    );
  }
}

export { NamespaceListener };
