const room = require("./room.socket");
const user = require("./user.socket");
const { User, Namespace, Room, Message } = require("../models");
const fs = require("fs");
const path = require("path");

const namespaces = {
  getNamespacesData(ios, clients) {
    try {
      const ns = ios.of(/^\/\w+$/);

      ns.on("connect", async (nsSocket) => {
        console.log(nsSocket.request.user);

        try {
          const namespaceId = nsSocket.nsp.name.slice(1);

          await room.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on("getNamespaceUsers", async (namespaceId) => {
          console.log(namespaceId);
          await namespaces.getNamespaceUsers(nsSocket, namespaceId, clients);
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

      let userList = (
        await Namespace.findByPk(namespaceId, {
          include: [
            {
              model: User,
              as: "namespaceHasUsers",
              attributes: {
                exclude: ["password", "email", "created_at", "updated_at"],
              },
            },
          ],
        })
      ).toJSON();

      userList = userList.namespaceHasUsers.map((element) => {
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

      console.log(t1 - t0 + "ms");

      nsSocket.emit("userList", userList);
    } catch (e) {
      throw e;
    }
  },
};

module.exports = namespaces;
