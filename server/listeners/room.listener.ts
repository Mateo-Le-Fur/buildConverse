import { Server } from "socket.io";
import { RoomInterface, SocketCustom } from "../interfaces";
import { SecurityManager } from "../sockets/security.socket";
import { RoomsManager } from "../sockets/room.socket";
import roomValidator from "../validation/schema/room.schema";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";

class RoomListener {
  protected _ios: Server;
  protected _socket: SocketCustom;
  protected _securityManager: SecurityManager;
  private _authorizations: AuthorizationsInterface;
  private _user: number | undefined;
  private _roomManager: RoomsManager;
  constructor(
    { socket, ios, authorizations, securityManager }: {
      socket: SocketCustom;
      ios: Server;
      authorizations: AuthorizationsInterface;
      securityManager: SecurityManager;
    },
    roomManager: RoomsManager
  ) {
    this._ios = ios;
    this._socket = socket;
    this._authorizations = authorizations;
    this._securityManager = securityManager;

    this._roomManager = roomManager;

    this._user = this._socket.request.user?.id;

    this.joinRoomListener();
    this.loadMoreMessagesListener();
    this.leaveRoomListener();
    this.createRoomListener();
    this.updateRoomListener();
    this.deleteRoomListener();
  }

  joinRoomListener() {
    this._socket.on(
      "joinRoom",
      async (data: { roomId: number; namespaceId: number }) => {
        try {
          await this._securityManager.isAllowedToJoinRoom(
            this._socket,
            this._authorizations,
            data
          );
          await this._roomManager.joinRoom(this._socket, data.roomId);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  loadMoreMessagesListener() {
    this._socket.on(
      "loadMoreMessages",
      async (data: {
        id: number;
        messagesArrayLength: number;
        isBeginningConversation: boolean;
      }) => {
        try {
          const checkAuthorization = this._authorizations.room.has(data.id);

          if (!checkAuthorization) throw new Error("forbidden");

          await this._roomManager.loadMoreMessage(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  leaveRoomListener() {
    this._socket.on("leaveRoom", (roomId: number) => {
      this._roomManager.leaveRoom(this._socket, roomId);
    });
  }
  createRoomListener() {
    this._socket.on("createRoom", async (data: RoomInterface, callback) => {
      try {
        await roomValidator.validateAsync(data);
        await this._securityManager.checkIfUserIsAdminOfNamespace(this._socket, this._authorizations, data.namespaceId)
        await this._roomManager.createRoom(data);
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
    });
  }
  updateRoomListener() {
    this._socket.on("updateRoom", async (data: RoomInterface, callback) => {
      try {
        await roomValidator.validateAsync(data);
        await this._securityManager.checkIfUserIsAdminOfNamespace(this._socket, this._authorizations, data.namespaceId)
        await this._roomManager.updateRoom(this._socket, data);
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
    });
  }
  deleteRoomListener() {
    this._socket.on("deleteRoom", async (data: RoomInterface, callback) => {
      try {
        await this._securityManager.checkIfUserIsAdminOfNamespace(this._socket, this._authorizations, data.namespaceId)
        await this._roomManager.deleteRoom(this._socket, data);
      } catch (e) {
        if (e instanceof Error) {
          if (typeof callback === "function")
            callback({
              status: "error",
              message: e.message,
            });
        }
      }
    });
  }
}

export { RoomListener };
