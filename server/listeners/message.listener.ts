import { Namespace, Server } from "socket.io";
import { MessageInterface, SocketCustom } from "../interfaces";
import { MessageManager } from "../sockets/message.socket";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";
import { SecurityManager } from "../sockets/security.socket";

class MessageListener {
  protected _ios: Server;
  protected _socket: SocketCustom;
  private _authorizations: AuthorizationsInterface;
  private _messageManager: MessageManager;
  private _securityManager: SecurityManager;

  constructor(
    { socket, ios, authorizations, securityManager }: {
      socket: SocketCustom;
      ios: Server;
      authorizations: AuthorizationsInterface;
      securityManager: SecurityManager;
    },
    messageManager: MessageManager
  ) {
    this._ios = ios;
    this._socket = socket;
    this._authorizations = authorizations;
    this._securityManager = securityManager;

    this._messageManager = messageManager;

    this.messageListener();
  }

  messageListener() {
    this._socket.on("message", async (data: MessageInterface) => {
      try {
        const checkAuthorization = this._authorizations.room.has(data.roomId);
        if (!checkAuthorization) throw new Error("forbidden");
        await this._messageManager.sendMessage(this._socket, data);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export { MessageListener };
