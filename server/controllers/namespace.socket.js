const rooms = require("./rooms.socket");
const user = require("./user.socket");
const { User, Namespace, Room, Message } = require("../models");

const namespaces = {
  initNamespaces(ios) {
    {
      try {
        const ns = ios.of(/^\/\w+$/);

        ns.on("connect", async (nsSocket) => {
          console.log(nsSocket.request.user);

          try {
            const namespace_id = nsSocket.nsp.name.slice(1);

            await rooms.getAllRooms(nsSocket, namespace_id);
            await user.getNamespaceUser(nsSocket, namespace_id);
          } catch (e) {
            console.error(e);
          }

          nsSocket.on("joinRoom", async (roomId) => {
            await rooms.getAllMessages(nsSocket, roomId);
          });

          nsSocket.on("createRoom", async (data) => {
            const room = await Room.create({
              name: data.name,
              index: data.index,
              namespace_id: data.namespaceId,
            });

            ios.of(data.namespaceId).emit("rooms", [room]);
          });

          nsSocket.on("leaveRoom", (roomId) => {
            nsSocket.leave(`/${roomId}`);
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
    }
  },
};

module.exports = namespaces;
