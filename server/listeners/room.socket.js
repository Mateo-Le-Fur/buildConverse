const { User, Namespace, Room, Message } = require("../models");
const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");


const rooms = {
  async getAllRooms(nsSocket, namespace_id) {

    const getRooms = await Room.findAll({
      where: {
        namespace_id
      },
      order: [["created_at", "asc"]]
    });

    nsSocket.emit("rooms", getRooms);

  },

  async getAllMessages(nsSocket, roomId) {

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


  },

  async createRoom(ios, data) {

    const room = await Room.create({
      name: data.name,
      index: data.index,
      namespace_id: data.namespaceId
    });

    ios.of(data.namespaceId).emit("createRoom", room);

  },

  // TODO A finir après avoir fait le crud utilisateur
  async deleteRoom(ios, data) {
    console.log(data);

    await Room.destroy({
      where: {
        id: data.id
      }
    });

    ios.of(data.namespaceId).emit("deleteRoom", data);

  }
};

module.exports = rooms;
