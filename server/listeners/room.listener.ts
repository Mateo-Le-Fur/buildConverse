import { Server } from "socket.io";
import { RoomInterface, SocketCustom } from "../interfaces";
import { SecurityManager } from "../sockets/security.socket";
import { RoomsManager } from "../sockets/room.socket";
import roomValidator from "../validation/schema/room.schema";

class RoomListener extends RoomsManager {
  protected _ios: Server;
  protected _nsSocket: SocketCustom;
  protected _securityManager: SecurityManager;
  constructor(
    nsSocket: SocketCustom,
    ios: Server,
    clients: Map<number, string>
  ) {
    super(ios);
    this._securityManager = new SecurityManager(ios);
    this._ios = ios;
    this._nsSocket = nsSocket;

    this.joinRoomListener();
    this.loadMoreMessagesListener();
    this.leaveRoomListener();
    this.createRoomListener();
    this.updateRoomListener();
    this.deleteRoomListener();
  }

  joinRoomListener() {
    this._nsSocket.on("joinRoom", async (data) => {
      try {
        await this._securityManager.isAllowedToRetrieveMessages(
          this._nsSocket,
          data
        );
        await this.joinRoom(this._nsSocket, data);
      } catch (e) {
        console.error(e);
      }
    });
  }
  loadMoreMessagesListener() {
    this._nsSocket.on(
      "loadMoreMessages",
      async (data: {
        id: number;
        messagesArrayLength: number;
        isBeginningConversation: boolean;
      }) => {
        try {
          await this._securityManager.isAllowedToRetrieveMessages(
            this._nsSocket,
            {
              roomId: data.id,
            }
          );
          await this.loadMoreMessage(this._nsSocket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  leaveRoomListener() {
    this._nsSocket.on("leaveRoom", (roomId: number) => {
      this.leaveRoom(this._nsSocket, roomId);
    });
  }
  createRoomListener() {
    this._nsSocket.on("createRoom", async (data: RoomInterface, callback) => {
      try {
        await this._securityManager.checkIfUserIsAdminOfNamespace(
          this._nsSocket
        );
        await roomValidator.validateAsync(data);
        await this.createRoom(data);
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
    this._nsSocket.on("updateRoom", async (data: RoomInterface, callback) => {
      try {
        await this._securityManager.checkIfUserIsAdminOfNamespace(
          this._nsSocket
        );
        await roomValidator.validateAsync(data);
        await this.updateRoom(this._nsSocket, data);
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
    this._nsSocket.on("deleteRoom", async (data: RoomInterface, callback) => {
      try {
        await this._securityManager.checkIfUserIsAdminOfNamespace(
          this._nsSocket
        );
        await this.deleteRoom(this._nsSocket, data);
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
