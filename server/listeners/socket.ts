import type { NamespaceInterface } from "../interfaces/Namespace";
import type { SocketCustom } from "../interfaces/SocketCustom";
import { Server } from "socket.io";
import { server, app } from "../app";
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


class SocketManager {

  public clients: Map<number, string>;
  public ios: Server;
  private namespacesManager: NamespacesManager;
  private roomsManager: RoomsManager;
  private usersManager: UserManager;
  private messagesManager: MessageManager;

  constructor() {
    this.ios = new Server(server, {
      allowRequest: ensureAuthenticatedOnSocketHandshake,
      maxHttpBufferSize: 1e7,
      cors: { origin: "*", credentials: true }
    });
    this.clients = new Map();
    this.namespacesManager = new NamespacesManager(this.ios, this.clients);
    this.roomsManager = new RoomsManager(this.ios);
    this.usersManager = new UserManager(this.ios);
    this.messagesManager = new MessageManager(this.ios)
  }

  public init() {

    this.ios.on("connect", async (socket: SocketCustom) => {
      const { id } = socket.request.user!;
      console.log("client connected");

      app.set("socket", socket);

      if (id) this.clients.set(id, socket.id);

      try {
        await this.namespacesManager.getUserNamespaces(socket);
      } catch (e) {
        console.error(e);
      }

      socket.on("createNamespace", async (data: NamespaceInterface) => {
        try {
          await this.namespacesManager.createNamespace(socket, data);
        } catch (e) {
          console.error(e);
        }
      });

      socket.on(
        "userJoinNamespace",
        async (data: NamespaceInterface, callback) => {
          try {
            await this.namespacesManager.joinInvitation(socket, data);
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
          await this.usersManager.updateUser(socket, data);
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

      socket.on("deleteUser", async (data: { id: number, namespacesId: number[] }) => {
        try {
          await this.usersManager.deleteUser(socket, data);
        } catch (e) {
          console.error(e);
        }
      });

      socket.on("join", async (data: { namespaces: number[] }) => {
        this.usersManager.connectUser(socket, data);
      });

      socket.on("leave", async (data: { namespaces: number[] }) => {
        this.usersManager.disconnectUser(socket, data);
        socket.disconnect(true);
      });

      socket.on("jwt_expire", (data: string) => {
        if (data) {
          try {
            const cookies = cookieParser.parse(
              socket.handshake.headers.cookie || ""
            );
            authProtect.decodedToken(cookies.jwt);
          } catch (e) {
            console.error(e);
            socket.emit("jwt_expire", true);
          }
        }
      });

      socket.on("disconnect", () => {
        const { id } = socket.request.user!;

        if (id) this.clients.delete(id);

        console.log("disconnect home");
      });
    });

    this.initNamespace();
  }

  private initNamespace() {
    try {
      const ns = this.ios.of(/^\/\w+$/);

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
          await this.roomsManager.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on(
          "updateNamespace",
          async (data: { id: number; values: NamespaceInterface, avatar: Buffer }, callback) => {
            try {
              await this.namespacesManager.updateNamespace(nsSocket, data);
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
              await this.namespacesManager.deleteNamespace(nsSocket, data);
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
              await this.namespacesManager.leaveNamespace(nsSocket, data);
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
            console.log(data);
            await this.namespacesManager.getNamespaceUsers(nsSocket, data, this.clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("loadMoreUser", async (data: { length: number; namespaceId: number }) => {
          try {
            await this.namespacesManager.loadMoreUser(nsSocket, data, this.clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("joinRoom", async (roomId: number) => {
          try {
            nsSocket.join(`/${roomId}`);
            await this.roomsManager.getAllMessages(nsSocket, roomId);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("leaveRoom", (roomId: RoomInterface) => {
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data: RoomInterface) => {
          try {
            await this.roomsManager.createRoom(data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("updateRoom", async (data: RoomInterface) => {
          try {
            await this.roomsManager.updateRoom(data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("deleteRoom", async (data: RoomInterface) => {
          await this.roomsManager.deleteRoom(nsSocket, data);
        });

        nsSocket.on("message", async (data: MessageInterface) => {
          try {
            await this.messagesManager.sendMessage(ns, nsSocket, data);
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