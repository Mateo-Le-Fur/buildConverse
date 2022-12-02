const { User, Namespace, Room, Message } = require("../models");
const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");


const rooms = {
  async getAllRooms(nsSocket, namespace_id) {
    try {
      const getRooms = await Room.findAll({
        where: {
          namespace_id
        },
        order: [["created_at", "asc"]]
      });

      nsSocket.emit("rooms", getRooms);
    } catch (e) {
      throw e;
    }
  },

  async getAllMessages(nsSocket, roomId) {
    try {

      const { id } = nsSocket.request.user;

      nsSocket.join(`/${roomId}`);


      let messages = await Message.findAll({
        where: {
          room_id: roomId
        },
        order: [["created_at", "asc"]],
        raw: true,
        nest: true
      });


      messages = messages.map((message) => {
        const buffer = fs.readFileSync(path.join(__dirname, `..${message.avatar_author}`), "base64");

        return {
          ...message,
          avatar_author: buffer
        };
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
        namespace_id: data.namespaceId
      });

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
          id: data.id
        }
      });

      ios.of(data.namespaceId).emit("deleteRoom", data);
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = rooms;
