const room = require("./room.socket");
const user = require("./user.socket");
const { User, Namespace, Room, Message } = require("../models");
const fs = require("fs");
const path = require("path");
const UserHasNamespace = require("../models/UserHasNamespace");
const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");

const namespaces = {
  getNamespacesData(ios, socket, clients) {
    try {
      const ns = ios.of(/^\/\w+$/);

      // Je vérifie que l'utilisateur a les droits de se connecter au serveur
      ns.use(async (socket, next) => {
        const { id } = socket.request.user;
        const namespaceId = socket.nsp.name.substring(1);

        const namespace = await Namespace.findByPk(namespaceId);

        const isAuthorize = await namespace.getNamespaceHasUsers({
          where: {
            id,
          },
        });

        if (isAuthorize.length) {
          next();
        } else {
          next(new Error("Tu n'as pas accès à ce serveur "));
        }
      });

      ns.on("connect", async (nsSocket) => {
        console.log(
          `L'utilisateur : ${nsSocket.request.user.pseudo} est connecté sur le serveur ${nsSocket.nsp.name}`
        );

        try {
          const namespaceId = nsSocket.nsp.name.slice(1);

          await room.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on("getNamespaceUsers", async (namespaceId) => {
          await namespaces.getNamespaceUsers(nsSocket, namespaceId, clients);
        });

        nsSocket.on("loadMoreUser", async (data) => {
          await namespaces.loadMoreUser(nsSocket, data, clients);
        });

        nsSocket.on("joinRoom", async (roomId) => {
          await room.getAllMessages(nsSocket, roomId);
        });

        nsSocket.on("leaveRoom", (roomId) => {
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data) => {
          await room.createRoom(ios, data);
        });

        // TODO A finir après avoir fait le crud utilisateur
        nsSocket.on("deleteRoom", async (data) => {
          await room.deleteRoom(ios, data);
        });

        // nsSocket.on("updateUser", async (data) => {
        //   await user.updateUser(ios, data);
        // });

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
          nsSocket.disconnect();
          console.log("disconnect");
        });
      });
    } catch (e) {
      throw e;
    }
  },

  async getNamespaceUsers(nsSocket, namespaceId, clients) {
    try {
      const t0 = performance.now();

      let namespace = await Namespace.findByPk(namespaceId);

      const user = await client.query(
        `SELECT COUNT("User"."id") AS "numberOfUsers" FROM "user" AS "User"
          INNER JOIN "user_has_namespace" AS "UserHasNamespace"
          ON "UserHasNamespace"."namespace_id" = ${namespaceId} GROUP BY "User"."id"
          LIMIT 1`,
        { type: QueryTypes.SELECT }
      );

      let users = await namespace.getNamespaceHasUsers({
        limit: 50,
        offset: 0,
        raw: true,
        nest: true,
      });

      users = users.map((element) => {
        const checkIfUserConnected = clients.get(element.id);

        const buffer = fs.readFileSync(
          path.join(
            __dirname,
            `..${
              element.avatar_url ? element.avatar_url : "/images/default-avatar"
            }`
          ),
          {
            encoding: "base64",
          }
        );

        return {
          ...element,
          avatar_url: buffer,
          status: checkIfUserConnected ? "online" : "offline",
        };
      });

      const t1 = performance.now();

      console.log(`get user list : ${t1 - t0} ms`);

      nsSocket.emit("userList", {
        users,
        numberOfUsers: user[0].numberOfUsers,
      });
    } catch (e) {
      throw e;
    }
  },

  async loadMoreUser(nsSocket, data, clients) {
    const { length, namespaceId } = data;

    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    console.log(length);

    let user = await namespace.getNamespaceHasUsers({
      limit: 50,
      offset: length,
      raw: true,
      nest: true,
    });

    user = user.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      const buffer = fs.readFileSync(
        path.join(
          __dirname,
          `..${
            element.avatar_url ? element.avatar_url : "/images/default-avatar"
          }`
        ),
        {
          encoding: "base64",
        }
      );

      return {
        ...element,
        avatar_url: buffer,
        status: checkIfUserConnected ? "online" : "offline",
      };
    });

    const t1 = performance.now();

    console.log(`load more user : ${t1 - t0} ms`);

    nsSocket.emit("loadMoreUser", user);
  },
};

module.exports = namespaces;
