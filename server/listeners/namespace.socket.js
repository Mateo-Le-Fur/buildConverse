const room = require("./room.socket");
const user = require("./user.socket");
const { User, Namespace, Room, Message } = require("../models");

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
          await user.getNamespaceUsers(nsSocket, namespaceId, clients);
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

        nsSocket.on("deleteRoom", async (data) => {
          await room.deleteRoom(ios, data);
        });

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

        nsSocket.on("leave", () => {
          nsSocket.disconnect(true);
        });

        nsSocket.on("disconnect", () => {
          console.log("disconnect");
        });
      });
    } catch (e) {
      throw e;
    }
  },
};

module.exports = namespaces;
