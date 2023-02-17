import {
  NamespaceInterface,
  SocketCustom,
  UpdateNamespaceInterface,
} from "../interfaces";
import { Server } from "socket.io";
import namespaceValidator from "../validation/schema/namespace.schema";
import { NamespacesManager } from "../sockets/namespace.socket";
import { SecurityManager } from "../sockets/security.socket";

class DynamicNamespaceListener extends NamespacesManager {
  private _nsSocket: SocketCustom;
  protected _ios: Server;
  protected _clients: Map<number, string>;
  private _securityManager: SecurityManager;
  constructor(
    nsSocket: SocketCustom,
    ios: Server,
    clients: Map<number, string>
  ) {
    super(ios, clients);
    this._securityManager = new SecurityManager(ios);
    this._nsSocket = nsSocket;
    this._ios = ios;
    this._clients = clients;

    this.updateNamespaceListener();
    this.deleteNamespaceListener();
    this.userLeaveNamespaceListener();
    this.getNamespaceUsersListener();
    this.loadMoreUserListener();
  }

  updateNamespaceListener() {
    this._nsSocket.on(
      "updateNamespace",
      async (data: UpdateNamespaceInterface, callback) => {
        try {
          await this._securityManager.checkIfUserIsAdminOfNamespace(
            this._nsSocket
          );
          await namespaceValidator.validateAsync(data);
          await this.updateNamespace(this._nsSocket, data);
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
  deleteNamespaceListener() {
    this._nsSocket.on(
      "deleteNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          await this._securityManager.checkIfUserIsAdminOfNamespace(
            this._nsSocket
          );
          await this.deleteNamespace(this._nsSocket, data);
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
  userLeaveNamespaceListener() {
    this._nsSocket.on(
      "userLeaveNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          await this.leaveNamespace(this._nsSocket, data);
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

  getNamespaceUsersListener() {
    this._nsSocket.on("getNamespaceUsers", async () => {
      try {
        await this.getNamespaceUsers(this._nsSocket);
      } catch (e) {
        console.error(e);
      }
    });
  }
  loadMoreUserListener() {
    this._nsSocket.on(
      "loadMoreUser",
      async (data: { currentArrayLength: number }) => {
        try {
          await this.loadMoreUser(this._nsSocket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  disconnect() {
    this._nsSocket.on("disconnect", () => {
      const namespaceId = this._nsSocket.nsp.name;
      const userId = this._nsSocket.request.user?.id;
      this._ios.of(namespaceId).emit("userDisconnect", { id: userId });
      this._nsSocket.disconnect();
    });
  }
}

export { DynamicNamespaceListener };
