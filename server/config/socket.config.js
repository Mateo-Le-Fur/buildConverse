const socketio = require("socket.io");
const { server } = require("../app");
const { instrument } = require("@socket.io/admin-ui");
const { ensureAuthenticatedOnSocketHandshake } = require("./security.config");
const namespaces = require("../controllers/namespace.socket");
const { User, Namespace, Room, Message } = require("../models");

let ios;

const initSocketServer = async () => {
  ios = socketio(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
    credentials: true,
    cors: {
      origin: "*",
    },
  });

  ios.on("connect", async (socket) => {
    console.log("connexion ios ok");

    try {
      const userId = socket.request.user.id;

      const userNamespaces = (
        await User.findByPk(userId, {
          include: ["userHasNamespaces"],
        })
      ).toJSON();

      socket.emit("namespaces", userNamespaces.userHasNamespaces);
    } catch (e) {
      console.error(e);
    }

    socket.on("createNamespace", async (data) => {
      try {
        const userId = socket.request.user.id;

        const createNamespace = await Namespace.create({
          name: data.name,
          invite_code: data.invite_code,
          img_url: data.img_url,
        });

        const { id } = createNamespace.toJSON();

        await Room.create({
          name: "# Général",
          index: 1,
          namespace_id: id,
        });

        const user = await User.findByPk(socket.request.user.id);

        await user.addUserHasNamespaces(createNamespace);

        socket.emit("createdNamespace", [createNamespace]);
      } catch (e) {
        console.error(e);
      }
    });

    namespaces.initNamespaces(ios);

    socket.on("leave", () => {
      socket.disconnect(true);
    });

    socket.on("disconnect", () => {
      console.log("disconnect home");
    });
  });
};

initSocketServer();

instrument(ios, {
  auth: false,
});
