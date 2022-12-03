const { Server } = require("socket.io");
const { server, app } = require("../app");
const {
  ensureAuthenticatedOnSocketHandshake
} = require("../config/security.config");
const namespaces = require("./namespace.socket");
const user = require("./user.socket");

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

    clients.set(socket.request.user.id, socket.id);

    try {
      await namespaces.getUserNamespaces(ios, socket, clients);
    } catch (e) {
      console.error(e)
    }

    socket.on("invitationToNamespace", async (data) => {
      try {
        await namespaces.joinInvitation(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("createNamespace", async (data) => {
      try {
        await namespaces.createNamespace(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateUser", async (data) => {
      try {
        await user.updateUser(socket, ios, data);
      } catch (e) {
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
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      const { id } = socket.request.user;
      clients.delete(id);
      console.log("disconnect home");
    });
  });
};

(async () => await initSocketServer())();

app.set("socketio", ios);
