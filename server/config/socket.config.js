const socketio = require("socket.io");
const { server } = require("../app");
const { ensureAuthenticatedOnSocketHandshake } = require("./security.config");
const { User, Namespace, Room, Message } = require("../models");

let ios;

const initNamespaces = async (init, data) => {
  console.log(data);

  try {
    const ns = ios.of(/^\/\w+$/);

    ns.on("connect", async (nsSocket) => {
      console.log(nsSocket.request.user);

      try {
        const namespace_id = nsSocket.nsp.name.slice(1, 3);

        const userList = await Namespace.findByPk(namespace_id, {
          include: [
            {
              model: User,
              as: "namespaceHasUsers",
              attributes: { exclude: ["password"] },
            },
          ],
        });

        const rooms = await Room.findAll({
          include: ["namespaces"],
          where: {
            namespace_id,
          },
        });

        nsSocket.emit("rooms", rooms);

        nsSocket.emit("userList", userList.namespaceHasUsers);
      } catch (e) {
        throw e;
      }

      nsSocket.on("joinRoom", async (roomId) => {
        try {
          nsSocket.join(`/${roomId}`);

          const messages = await Message.findAll({
            where: {
              room_id: roomId,
            },
            order: [["created_at", "desc"]],
          });

          console.log(roomId);

          nsSocket.emit("history", messages);
        } catch (e) {
          console.error(e);
        }
      });

      nsSocket.on("leaveRoom", (roomId) => {
        nsSocket.leave(`/${roomId}`);
      });

      nsSocket.on("userList", async () => {});

      nsSocket.on("message", async ({ text, roomId }) => {
        try {
          const { id, pseudo } = nsSocket.request.user;

          const message = await Message.create({
            data: text,
            data_type: "text",
            room_id: roomId,
            user_id: id,
            author_name: pseudo,
          });

          ns.to(`/${roomId}`).emit("message", message);
        } catch (e) {
          throw e;
        }
      });

      nsSocket.on("disconnect", () => {
        console.log("disconnect");
      });
    });
  } catch (e) {
    throw e;
  }
};

const initSocketServer = async () => {
  ios = socketio(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
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

    socket.on("joinNamespace", (data) => {
      console.log("Join namespace");
      try {
        initNamespaces(false, data, socket);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("createNamespace", async (data) => {
      try {
        const userId = socket.request.user.id;

        const createNamespace = await Namespace.create({
          name: data.name,
          invite_code: data.invite_code,
          img_url: data.img,
        });

        const { id } = createNamespace.toJSON();

        await Room.create({
          name: "# Général",
          index: 1,
          namespace_id: id,
        });

        const user = await User.findByPk(socket.request.user.id);

        await user.addUserHasNamespaces(createNamespace);

        const userNamespaces = (
          await User.findByPk(userId, {
            include: ["userHasNamespaces"],
          })
        ).toJSON();

        socket.emit("namespaces", userNamespaces.userHasNamespaces);
      } catch (e) {
        console.error(e);
      }
    });

    initNamespaces(true, "", null);

    socket.on("disconnect", () => {
      console.log("disconnect home");
      socket.removeAllListeners();
    });
  });
};

initSocketServer();
