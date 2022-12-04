const { User, Message } = require("../models");
const fs = require("fs");
const path = require("path");
const message = {

  async sendMessage(ns, nsSocket, data) {

      const { id } = nsSocket.request.user;

      const user = await User.findByPk(id, {
        attributes: ["avatar_url", "pseudo"],
        raw: true
      });


      let message = (
        await Message.create({
          data: data.text,
          data_type: "text",
          room_id: data.roomId,
          user_id: id,
          author_name: user.pseudo,
          avatar_author: user.avatar_url
        })
      ).get();

      message = {
        ...message,
        avatar_author: `${process.env.DEV_AVATAR_URL}/user/${id}/${Date.now()}/avatar`
      };

      ns.to(`/${data.roomId}`).emit("message", message);

  }
}

module.exports = message