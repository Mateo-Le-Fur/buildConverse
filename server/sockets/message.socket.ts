import {User, Message} from "../models";
import {Server, Socket} from "socket.io";
import {MessageInterface} from "../interfaces/Message";
import {SocketCustom} from "../interfaces/SocketCustom";
import {Namespace} from "socket.io/dist/namespace";

class MessageManager {
  protected _ios: Server;

  constructor(ios: Server) {
    this._ios = ios;
  }

  public async sendMessage(socket: SocketCustom, data: MessageInterface) {
    const userId = socket.request.user?.id;


    const user = await User.findByPk(userId, {
      attributes: ["pseudo", ["avatar_url", "avatarUrl"]],
      raw: true,
    });


    if (user) {
      let message = (
        await Message.create({
          data: data.data,
          dataType: "text",
          roomId: data.roomId,
          userId: userId,
          authorName: user.pseudo,
          avatarAuthor: user.avatarUrl,
        })
      ).get();

      message = {
        ...message,
        avatarAuthor: `${
          process.env.DEV_AVATAR_URL
        }/user/${userId}/${Date.now()}/avatar`,
      };

      this._ios.to(`room-${data.roomId}`).emit("message", message);
    }
  }
}

export {MessageManager};
