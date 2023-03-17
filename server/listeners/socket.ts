import {Server} from "socket.io";
import {server} from "../app";
import {ensureAuthenticatedOnSocketHandshake} from "../config/security.config";
import {
  FriendsManager,
  MessageManager,
  NamespacesManager,
  RoomsManager,
  SecurityManager,
  UserManager,
} from "./index";
import {SocketCustom} from "../interfaces";
import {SocketListener} from "./socketListener";


class SocketServer {
  get listeners(): Map<number | undefined, Set<SocketListener>> {
    return this._listeners;
  }

  get ios(): Server {
    return this._ios;
  }

  get clients(): Map<number, string> {
    return this._clients;
  }

  private _ios: Server;
  private _clients: Map<number, string>;
  private _listeners: Map<number | undefined, Set<SocketListener>>;
  public securityManager: SecurityManager;
  public friendManager: FriendsManager;
  public namespaceManager: NamespacesManager;
  public messageManager: MessageManager;
  public roomManager: RoomsManager;
  public userManager: UserManager;

  constructor() {
    this._ios = new Server(server, {
      allowRequest: ensureAuthenticatedOnSocketHandshake,
      maxHttpBufferSize: 1e7,
      cors: {origin: "*"},
    });
    this._clients = new Map();
    this._listeners = new Map();
    this.securityManager = new SecurityManager(this._ios);
    this.friendManager = new FriendsManager(this._ios, this._clients);
    this.messageManager = new MessageManager(this._ios);
    this.roomManager = new RoomsManager(this._ios);
    this.userManager = new UserManager(this._ios, this._clients);
    this.namespaceManager = new NamespacesManager(this._ios, this._clients);
  }

  public async init() {

    this._ios.on("connect", async (socket: SocketCustom) => {
      const userId = socket.request.user?.id;

      if (userId) this._clients.set(userId, socket.id);

      try {
        const listener = new SocketListener(this, socket);
        await listener.initAllSocketListeners();

        let listenersSet = this._listeners.get(userId);
        if (!listenersSet) listenersSet = new Set();

        listenersSet.add(listener);
        this._listeners.set(userId, listenersSet);


      } catch (e) {
        console.error(e);
      }
    });
  }
}

export default SocketServer;
