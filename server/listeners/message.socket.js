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

      const buffer = fs.readFileSync(
        path.join(__dirname, `..${user.avatar_url}`),
        "base64"
      );

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
        avatar_author: buffer
      };

      ns.to(`/${data.roomId}`).emit("message", message);

  }
}

module.exports = message