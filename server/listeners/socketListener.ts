import { Namespace, Server } from "socket.io";
import { NamespaceInterface, SocketCustom } from "../interfaces";
import { SecurityManager } from "../sockets/security.socket";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";
import { FriendListener } from "./friend.listener";
import { NamespaceListener } from "./namespace.listener";
import { UserListener } from "./user.listener";
import { RoomListener } from "./room.listener";
import { MessageListener } from "./message.listener";
import { User, Namespace } from "../models";
import SocketServer from "./socket";
import protect from "../config/jwt.config";
class SocketListener {
  private _shared: {
    authorizations: AuthorizationsInterface;
    socket: SocketCustom;
    securityManager: SecurityManager;
    ios: Server;
  };

  get authorizations(): AuthorizationsInterface {
    return this._authorizations;
  }

  protected _ios: Server;
  protected _clients: Map<number, string>;
  private _authorizations: AuthorizationsInterface;
  private _socket: SocketCustom;
  private _socketServer: SocketServer;

  constructor(socketServer: SocketServer, socket: SocketCustom) {
    this._socketServer = socketServer;
    this._ios = this._socketServer.ios;
    this._clients = this._socketServer.clients;
    this._socket = socket;

    this._authorizations = {
      room: new Set(),
      adminServer: new Set()
    };

    this._shared = {
      socket: this._socket,
      ios: this._ios,
      authorizations: this._authorizations,
      securityManager: this._socketServer.securityManager
    };
  }

  async initAllSocketListeners() {

    this._socket.onAny(() => {
      protect.ensureAuthenticatedOnSocketServer(this._socket.request, this._socket)
    })


    new MessageListener(this._shared, this._socketServer.messageManager);
    new RoomListener(this._shared, this._socketServer.roomManager);

    const friendListener = await new FriendListener(this._shared, this._socketServer.friendManager, this._socketServer.userManager);
    const namespaceListener = await new NamespaceListener(this._shared, this._socketServer.namespaceManager);
    const userListener = await new UserListener(this._shared, this._socketServer.userManager);

    const namespaces = await namespaceListener.onConnect();
    const friends = await friendListener.onConnect();

    this.setAuthorizations(namespaces);
    await this.joinServers(namespaces);

    this._socket.emit("namespaces", namespaces);

    this._socket.on("disconnect", () => {
      const userId = this._socket.request.user?.id;
      userListener.disconnect(this._socket, this._clients);
      this._socketServer.listeners.delete(userId);
      this._socket.disconnect();
    });
  }

  setAuthorizations(namespaces: NamespaceInterface[] | undefined) {
    namespaces?.forEach((namespace) => {
      if (namespace.UserHasNamespace.admin) {
        this._authorizations.adminServer.add(namespace.id);
        namespace.rooms.forEach((room) => {
          this._authorizations.room.add(room.id);
        });
      }
    });
  }

  async joinServers(namespaces: NamespaceInterface[] | undefined) {
    namespaces?.forEach((ns) => {
      this._socket.join(`server-${ns.id}`);
    });

    await this.connectUser(namespaces);
  }

  async connectUser(namespaces: NamespaceInterface[] | undefined) {
    if (namespaces) {
      const user = await User.findByPk(this._socket.request.user?.id, {
        attributes: {
          exclude: ["password", "email"]
        },
        raw: true
      });

      namespaces.forEach((ns) => {
        const newUser = {
          ...user,
          UserHasNamespace: {
            namespaceId: ns.id,
            admin: this._authorizations.adminServer.has(ns.id)
          }
        };
        this._ios
          .to(`server-${ns.id}`)
          .emit("userConnectedToTheServer", [newUser]);
      });
    }
  }
}

export { SocketListener };
