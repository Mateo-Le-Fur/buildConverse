const { User, Namespace, Room, Message } = require("../models");
const client = require("../config/sequelize");
const {QueryTypes} = require("sequelize");


const rooms = {
  async getAllRooms(nsSocket, namespace_id) {
    try {
      const getRooms = await Room.findAll({
        where: {
          namespace_id,
        },
        order: [["created_at", "asc"]],
      });

      nsSocket.emit("rooms", getRooms);
    } catch (e) {
      throw e;
    }
  },

  async getAllMessages(nsSocket, roomId) {
    try {
      nsSocket.join(`/${roomId}`);


      const messages = await Message.findAll({
        where: {
          room_id: roomId,
        },
        order: [["created_at", "asc"]],
      });


      nsSocket.emit("history", messages);
    } catch (e) {
      console.error(e);
    }
  },

  async createRoom(ios, data) {
    try {
      const room = await Room.create({
        name: data.name,
        index: data.index,
        namespace_id: data.namespaceId,
      });

      console.log(room)

      ios.of(data.namespaceId).emit("createRoom", room);
    } catch (e) {
      console.error(e);
    }
  },

  // TODO A finir après avoir fait le crud utilisateur
  async deleteRoom(ios, data) {
    console.log(data);
    try {
      await Room.destroy({
        where: {
          id: data.id,
        },
      });

      ios.of(data.namespaceId).emit("deleteRoom", data);
    } catch (e) {
      console.error(e);
    }
  },
};

module.exports = rooms;
