import { Namespace, Server } from "socket.io";
import { MessageInterface, SocketCustom } from "../interfaces";
import { SecurityManager } from "../sockets/security.socket";
import { MessageManager } from "../sockets/message.socket";
class MessageListener extends MessageManager {
  protected _ios: Server;
  protected _socket: SocketCustom;
  protected _securityManager: SecurityManager;
  private _ns: Namespace;
  constructor(ns: Namespace, socket: SocketCustom, ios: Server) {
    super(ios);
    this._securityManager = new SecurityManager(ios);
    this._ns = ns;
    this._ios = ios;
    this._socket = socket;

    this.messageListener();
  }

  messageListener() {
    this._socket.on("message", async (data: MessageInterface) => {
      try {
        await this.sendMessage(this._ns, this._socket, data);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export { MessageListener };
