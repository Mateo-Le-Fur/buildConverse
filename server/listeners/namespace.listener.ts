import { Server } from "socket.io";
import {
  NamespaceInterface,
  SocketCustom,
  UpdateNamespaceInterface
} from "../interfaces";
import { NamespacesManager } from "../sockets/namespace.socket";
import { SecurityManager } from "../sockets/security.socket";
import { Namespace } from "../models";
import namespaceValidator from "../validation/schema/namespace.schema";
import joinNamespaceValidator from "../validation/schema/joinNamespace.schema";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";
import listenerHandler from "../helpers/listenerHandler";
import { Acknowledgment } from "../interfaces/Acknowledgment";

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
      listenerHandler(async (data: NamespaceInterface, callback: Acknowledgment) => {
          const userId = this._socket.request.user?.id;
          await this._securityManager.checkUserNamespacesLimit(
            userId,
            this._namespaceManager.userNamespacesLimit
          );
          await namespaceValidator.validateAsync(data);
          await this._namespaceManager.createNamespace(this._socket, data);
          callback({ status: "ok", message: "" });
        }
      ));
  }

  updateNamespaceListener() {
    this._socket.on(
      "updateNamespace",
      listenerHandler(async (data: UpdateNamespaceInterface, callback: Acknowledgment) => {
          await this._securityManager.checkIfUserIsAdminOfNamespace(
            this._socket,
            this._authorizations,
            data.namespaceId
          );
          await namespaceValidator.validateAsync(data);
          await this._namespaceManager.updateNamespace(this._socket, data);
          callback({ status: "ok", message: "" });
        }
      ));
  }

  deleteNamespaceListener() {
    this._socket.on(
      "deleteNamespace",
      listenerHandler(async (namespaceId: number, callback: Acknowledgment) => {
          await this._securityManager.checkIfUserIsAdminOfNamespace(
            this._socket,
            this._authorizations,
            namespaceId
          );
          await this._namespaceManager.deleteNamespace(
            this._socket,
            namespaceId
          );
          callback({ status: "ok", message: "" });
        }
      ));
  }

  userLeaveNamespaceListener() {
    this._socket.on(
      "userLeaveNamespace",
      listenerHandler(async (namespaceId: number, callback: Acknowledgment) => {
          await this._namespaceManager.leaveNamespace(
            this._socket,
            namespaceId
          );
          const rooms = this._authorizations.namespaceHasRooms.get(namespaceId);
          this._authorizations.namespaceHasRooms.delete(namespaceId);
          rooms?.forEach((room) => this._authorizations.room.delete(room));
          callback({ status: "ok", message: "" });
        }
      ));
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
      listenerHandler(async (data: NamespaceInterface, callback: Acknowledgment) => {
          await joinNamespaceValidator.validateAsync(data);
          await this._securityManager.beforeUserJoinNamespace(this._socket, this._namespaceManager.userLimit);
          await this._namespaceManager.joinInvitation(this._socket, data);
          callback({
            status: "ok",
            message: ""
          });
        }
      ));
  }
}

export { NamespaceListener };
