import { Server } from "socket.io";
import {
  NamespaceInterface,
  SocketCustom,
  UpdateNamespaceInterface,
} from "../interfaces";
import { NamespacesManager } from "../sockets/namespace.socket";
import { SecurityManager } from "../sockets/security.socket";
import { Namespace } from "../models";
import namespaceValidator from "../validation/schema/namespace.schema";
import joinNamespaceValidator from "../validation/schema/joinNamespace.schema";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";

class NamespaceListener {
  protected _ios: Server;
  protected _socket: SocketCustom;
  protected _securityManager: SecurityManager;
  private _authorizations: AuthorizationsInterface;
  private _namespaceManager: NamespacesManager;
  constructor(
    { socket, ios, authorizations, securityManager }: {
      socket: SocketCustom;
      ios: Server;
      authorizations: AuthorizationsInterface;
      securityManager: SecurityManager;
    },
    namespaceManager: NamespacesManager
  ) {
    this._ios = ios;
    this._socket = socket;
    this._authorizations = authorizations;
    this._securityManager = securityManager;
    this._namespaceManager = namespaceManager;

    this.createNamespaceListener();
    this.userJoinNamespaceListener();
    this.updateNamespaceListener();
    this.deleteNamespaceListener();
    this.userLeaveNamespaceListener();
    this.getNamespaceUsersListener();
    this.loadMoreUserListener();
  }

  async onConnect() {
    return await this._namespaceManager.getUserNamespaces(this._socket);
  }

  createNamespaceListener() {
    this._socket.on(
      "createNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          const userId = this._socket.request.user?.id;
          await this._securityManager.checkUserNamespacesLimit(
            userId,
            this._namespaceManager.userNamespacesLimit
          );
          await namespaceValidator.validateAsync(data);
          await this._namespaceManager.createNamespace(this._socket, data);
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

  updateNamespaceListener() {
    this._socket.on(
      "updateNamespace",
      async (data: UpdateNamespaceInterface, callback) => {
        try {
          await this._securityManager.checkIfUserIsAdminOfNamespace(
            this._socket,
            this._authorizations,
            data.namespaceId
          );
          await namespaceValidator.validateAsync(data);
          await this._namespaceManager.updateNamespace(this._socket, data);
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
    this._socket.on(
      "deleteNamespace",
      async (namespaceId: number, callback) => {
        try {
          // if (!this._authorizations.isAdmin) {
          //   throw new Error("Tu dois être administrateur");
          // }
          await this._namespaceManager.deleteNamespace(
            this._socket,
            namespaceId
          );
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
    this._socket.on(
      "userLeaveNamespace",
      async (namespaceId: number, callback) => {
        try {
          await this._namespaceManager.leaveNamespace(
            this._socket,
            namespaceId
          );
          callback({
            status: "ok",
          });
        } catch (e) {
          if (e instanceof Error) {
            console.error(e)
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
    this._socket.on("getNamespaceUsers", async (namespaceId: number) => {
      try {
        await this._namespaceManager.getNamespaceUsers(
          this._socket,
          namespaceId
        );
      } catch (e) {
        console.error(e);
      }
    });
  }
  loadMoreUserListener() {
    this._socket.on(
      "loadMoreUser",
      async (data: { currentArrayLength: number; namespaceId: number }) => {
        try {
          await this._namespaceManager.loadMoreUser(this._socket, data);
        } catch (e) {
          console.error(e);
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
            await joinNamespaceValidator.validateAsync(data);
            await this._securityManager.checkIfUserAlreadyHasTheServer(
              this._socket,
              userId
            );
            await this._securityManager.checkUserNamespacesLimit(
              userId,
              this._namespaceManager.userLimit
            );
            await this._securityManager.checkIfServerIsFull(
              this._socket,
              this._namespaceManager.userLimit
            );
            await this._namespaceManager.joinInvitation(this._socket, data);
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
}

export { NamespaceListener };
