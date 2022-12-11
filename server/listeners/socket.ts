import type { NamespaceInterface } from "../interfaces/Namespace";
import type { SocketCustom } from "../interfaces/SocketCustom";
import { Server } from "socket.io";
import { server } from "../app";
import { ensureAuthenticatedOnSocketHandshake } from "../config/security.config";
import cookieParser from "cookie";
import { NamespacesManager } from "./namespace.socket";
import { UserManager } from "./user.socket";
import authProtect from "../config/jwt.config";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";
import { ExtendedError } from "socket.io/dist/namespace";
import { UserHasNamespace } from "../models";
import { RoomsManager } from "./room.socket";
import { RoomInterface } from "../interfaces/Room";
import { MessageInterface } from "../interfaces/Message";
import { MessageManager } from "./message.socket";
import { UpdateNamespaceInterface } from "../interfaces/UpdateNamespaceInterface";
import { DeleteUserInterface } from "../interfaces/DeleteUserInterface";


class SocketManager {

  private _ios: Server;
  private _clients: Map<number, string>;
  private _namespacesManager: NamespacesManager;
  private _roomsManager: RoomsManager;
  private _usersManager: UserManager;
  private _messagesManager: MessageManager;

  constructor() {
    this._ios = new Server(server, {
      allowRequest: ensureAuthenticatedOnSocketHandshake,
      maxHttpBufferSize: 1e7,
      cors: { origin: "*", credentials: true }
    });
    this._clients = new Map();
    this._namespacesManager = new NamespacesManager(this._ios, this._clients);
    this._roomsManager = new RoomsManager(this._ios);
    this._usersManager = new UserManager(this._ios);
    this._messagesManager = new MessageManager(this._ios);
  }

  public init() {
    this._ios.on("connect", async (socket: SocketCustom) => {
      const { id } = socket.request.user!;
      console.log("client connected");

      if (id) this._clients.set(id, socket.id);

      try {
        await this._namespacesManager.getUserNamespaces(socket);
      } catch (e) {
        console.error(e);
      }

      socket.on("createNamespace", async (data: NamespaceInterface) => {
        try {
          await this._namespacesManager.createNamespace(socket, data);
        } catch (e) {
          console.error(e);
        }
      });

      socket.on(
        "userJoinNamespace",
        async (data: NamespaceInterface, callback) => {
          try {
            await this._namespacesManager.joinInvitation(socket, data);
            callback({
              status: "ok"
            });
          } catch (e) {
            if (e instanceof Error) {
              callback({
                status: "error",
                message: e.message
              });
            }
          }
        }
      );


      socket.on("updateUser", async (data: UpdateUserInterface, callback) => {
        try {
          await this._usersManager.updateUser(socket, data);
          callback({
            status: "ok"
          });
        } catch (e) {
          if (e instanceof Error) {
            callback({
              status: "error",
              message: e.message
            });
            console.error(e);
          }
        }
      });

      socket.on("deleteUser", async (data: DeleteUserInterface) => {
        try {
          await this._usersManager.deleteUser(socket, data);
        } catch (e) {
          console.error(e);
        }
      });

      socket.on("join", async (data: { namespaces: number[] }) => {
        this._usersManager.connectUser(socket, data);
      });

      socket.on("leave", async (data: { namespaces: number[] }) => {
        this._usersManager.disconnectUser(socket, data);
        socket.disconnect(true);
      });

      socket.on("jwt_expire", (data: string) => {
        if (data) {
          try {
            const cookies = cookieParser.parse(
              socket.handshake.headers.cookie || ""
            );
            authProtect.decodedToken(cookies.jwt);
            socket.emit("jwt_expire", false);
          } catch (e) {
            console.error(e);
            socket.emit("jwt_expire", true);
          }
        }
      });

      socket.on("disconnect", () => {
        const { id } = socket.request.user!;

        if (id) this._clients.delete(id);

        console.log("disconnect home");
      });
    });

    this.initNamespace();
  }

  private initNamespace() {
    try {
      const ns = this._ios.of(/^\/\w+$/);

      ns.use(async (socket: SocketCustom, next: (err?: ExtendedError | undefined) => void) => {
        const { id } = socket.request.user!;
        const namespaceId = socket.nsp.name.substring(1);

        const isAuthorize = await UserHasNamespace.findOne({
          where: {
            user_id: id,
            namespace_id: namespaceId
          }
        });

        if (isAuthorize) {
          next();
        } else {
          next(new Error("Tu n'as pas accès à ce serveur "));
        }
      });

      ns.on("connect", async (nsSocket: SocketCustom) => {
        console.log(
          `L'utilisateur : ${nsSocket.request.user?.pseudo} est connecté sur le serveur ${nsSocket.nsp.name}`
        );

        try {
          const namespaceId = nsSocket.nsp.name.slice(1);
          await this._roomsManager.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on(
          "updateNamespace",
          async (data: UpdateNamespaceInterface, callback) => {
            try {
              await this._namespacesManager.updateNamespace(nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
              }
            }
          }
        );

        nsSocket.on(
          "deleteNamespace",
          async (data: NamespaceInterface, callback) => {
            try {
              await this._namespacesManager.deleteNamespace(nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
              }
            }
          }
        );

        nsSocket.on(
          "userLeaveNamespace",
          async (data: NamespaceInterface, callback) => {
            try {
              await this._namespacesManager.leaveNamespace(nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
                console.error(e);
              }
            }
          }
        );

        nsSocket.on("getNamespaceUsers", async (data: number) => {
          try {
            await this._namespacesManager.getNamespaceUsers(nsSocket, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("loadMoreUser", async (data: { currentArrayLength: number; namespaceId: number }) => {
          try {
            await this._namespacesManager.loadMoreUser(nsSocket, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("joinRoom", async (roomId: number) => {
          try {
            nsSocket.join(`/${roomId}`);
            await this._roomsManager.getAllMessages(nsSocket, roomId);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("leaveRoom", (roomId: RoomInterface) => {
          console.log(roomId)
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data: RoomInterface) => {
          try {
            await this._roomsManager.createRoom(data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("updateRoom", async (data: RoomInterface) => {
          try {
            await this._roomsManager.updateRoom(data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("deleteRoom", async (data: RoomInterface) => {
          await this._roomsManager.deleteRoom(nsSocket, data);
        });

        nsSocket.on("message", async (data: MessageInterface) => {
          try {
            await this._messagesManager.sendMessage(ns, nsSocket, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("disconnect", () => {
          nsSocket.disconnect();
          console.log("disconnect");
        });
      });
    } catch (e) {
      throw e;
    }
  }
}


const socketManager = new SocketManager();
socketManager.init();