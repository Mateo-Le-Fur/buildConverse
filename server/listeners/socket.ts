import { Socket } from "socket.io";
import type { UserInterface } from "../interfaces/User";
import type { NamespaceInterface } from "../interfaces/Namespace";
import type { SocketCustom } from "../interfaces/SocketCustom";

const { Server } = require("socket.io");
const { server, app } = require("../app");
import { ensureAuthenticatedOnSocketHandshake } from "../config/security.config";
import cookieParser from "cookie";
import namespaces from "./namespace.socket";
import user from "./user.socket";
import authProtect from "../config/jwt.config";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";

let ios: Socket;

const clients: Map<number, string> = new Map();

const initSocketServer = async () => {
  ios = new Server(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
    maxHttpBufferSize: 1e7,
    credentials: true,
    cors: ["*"]
  });

  ios.on("connect", async (socket: SocketCustom) => {
    const { id } = socket.request.user;
    console.log("client connected");

    app.set("socket", socket);

    if (id) clients.set(id, socket.id);

    try {
      await namespaces.getUserNamespaces(ios, socket, clients);
    } catch (e) {
      console.error(e);
    }

    socket.on(
      "userJoinNamespace",
      async (data: NamespaceInterface, callback) => {
        try {
          await namespaces.joinInvitation(ios, socket, data);
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

    socket.on("createNamespace", async (data: NamespaceInterface) => {
      try {
        await namespaces.createNamespace(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateUser", async (data: UpdateUserInterface, callback) => {
      try {
        await user.updateUser(socket, ios, data);
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
        await user.deleteUser(socket, ios, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("join", async (data: { namespaces: number[] }) => {
      user.connectUser(socket, ios, data);
    });

    socket.on("leave", async (data: { namespaces: number[] }) => {
      user.disconnectUser(socket, ios, data);
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
      const { id } = socket.request.user;

      if (id) clients.delete(id);

      console.log("disconnect home");
    });
  });
};

(async () => await initSocketServer())();
