import { User, Message } from "../models";
import { Socket } from "socket.io";
import { MessageInterface } from "../interfaces/Message";
import { SocketCustom } from "../interfaces/SocketCustom";
const message = {
  async sendMessage(
    ns: Socket,
    nsSocket: SocketCustom,
    data: MessageInterface
  ) {
    const { id } = nsSocket.request.user;

    const user = await User.findByPk(id, {
      attributes: ["pseudo", ["avatar_url", "avatarUrl"]],
      raw: true,
    });


    let message = (
      await Message.create({
        data: data.data,
        dataType: "text",
        room_id: data.roomId,
        user_id: id,
        authorName: user?.pseudo,
        avatarAuthor: user?.avatarUrl,
      })
    ).get();

    message = {
      ...message,
      avatarAuthor: `${
        process.env.DEV_AVATAR_URL
      }/user/${id}/${Date.now()}/avatar`,
    };

    ns.to(`/${data.roomId}`).emit("message", message);
  },
};

export default message;
