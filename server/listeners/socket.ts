import { Server, Socket } from "socket.io";
import { server } from "../app";
import { ensureAuthenticatedOnSocketHandshake } from "../config/security.config";
import { SecurityManager } from "./index";
import { SocketCustom } from "../interfaces";

import { FriendListener } from "./friend.listener";
import { NamespaceListener } from "./namespace.listener";
import { UserListener } from "./user.listener";
import { DynamicNamespaceListener } from "./dynamicNamespace.listener";
import { RoomListener } from "./room.listener";
import { MessageListener } from "./message.listener";

class SocketManager {
  private _ios: Server;
  private _clients: Map<number, string>;
  private _securityManager: SecurityManager;

  constructor() {
    this._ios = new Server(server, {
      allowRequest: ensureAuthenticatedOnSocketHandshake,
      maxHttpBufferSize: 1e7,
      cors: { origin: "http://localhost:3000" },
    });
    this._clients = new Map();
    this._securityManager = new SecurityManager(this._ios);
  }

  public init() {
    this._ios.on("connect", async (socket: SocketCustom) => {
      const id = socket.request.user?.id;

      if (id) this._clients.set(id, socket.id);

      try {
        new FriendListener(socket, this._ios, this._clients).onConnect();
        new NamespaceListener(socket, this._ios, this._clients).onConnect();
        new UserListener(socket, this._ios, this._clients);
      } catch (e) {
        console.error(e);
      }
    });

    this.initNamespace();
  }

  private async initNamespace() {
    const ns = this._ios.of(/^\/\d+$/);

    try {
      await this._securityManager.checkIfUserHasNamespace(ns);
    } catch (e) {
      console.error(e);
    }

    ns.on("connect", async (nsSocket: SocketCustom) => {
      new DynamicNamespaceListener(nsSocket, this._ios, this._clients);
      new RoomListener(nsSocket, this._ios, this._clients);
      new MessageListener(ns, nsSocket, this._ios);
    });
  }
}

export default SocketManager;
