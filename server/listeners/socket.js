const { Server } = require("socket.io");
const { server, app } = require("../app");
const {
  ensureAuthenticatedOnSocketHandshake
} = require("../config/security.config");
const cookieParser = require("cookie");
const namespaces = require("./namespace.socket");
const user = require("./user.socket");
const { decodedToken } = require("../config/jwt.config");

let ios;

const clients = new Map();

const initSocketServer = async () => {
  ios = new Server(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
    maxHttpBufferSize: 1e7,
    credentials: true,
    cors: ["*"]
  });

  ios.on("connect", async (socket) => {
    console.log("client connected");

    app.set("socket", socket);

    clients.set(socket.request.user.id, socket.id);

    try {
      await namespaces.getUserNamespaces(ios, socket, clients);
    } catch (e) {
      console.error(e);
    }

    socket.on("userJoinNamespace", async (data, callback) => {
      try {
        await namespaces.joinInvitation(ios, socket, data);
        callback({
          status: "ok"
        });
      } catch (e) {
        callback({
          status: "error",
          message: e.message
        });
      }
    });

    socket.on("createNamespace", async (data) => {
      try {
        await namespaces.createNamespace(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateUser", async (data, callback) => {
      try {
        await user.updateUser(socket, ios, data);
        callback({
          status: "ok"
        });
      } catch (e) {
        callback({
          status: "error",
          message: e.message
        });
        console.error(e);
      }
    });

    socket.on("deleteUser", async (data) => {
      try {
        await user.deleteUser(socket, ios, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("join", async (data) => {
      user.connectUser(socket, ios, data);
    });

    socket.on("leave", async (data) => {
      user.disconnectUser(socket, ios, data);
      socket.disconnect(true);
    });

    socket.on("jwt_expire", (data) => {
      if (data) {
        try {
          const cookies = cookieParser.parse(
            socket.handshake.headers.cookie || ""
          );
          const checkToken = decodedToken(cookies.jwt);
        } catch (e) {
          console.error(e);
          socket.emit("jwt_expire", true);
        }
      }
    });

    socket.on("disconnect", () => {
      const { id } = socket.request.user;
      clients.delete(id);
      console.log("disconnect home");
    });
  });
};

(async () => await initSocketServer())();
