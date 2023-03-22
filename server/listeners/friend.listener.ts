import { Server } from "socket.io";
import {
  FriendsInterface,
  PrivateMessageInterface,
  SocketCustom
} from "../interfaces";
import { FriendsManager } from "../sockets/friend.socket";
import { UserManager } from "../sockets/user.socket";
import { SecurityManager } from "../sockets/security.socket";
import { AuthorizationsInterface } from "../interfaces/AuthorizationsInterface";
import listenerHandler from "../helpers/listenerHandler";
import { Acknowledgment } from "../interfaces/Acknowledgment";

class FriendListener {
  protected _ios: Server;
  protected _socket: SocketCustom;
  private _usersManager: UserManager;
  private _friendManager: FriendsManager;
  private _securityManager: SecurityManager;
  private _authorizations: AuthorizationsInterface;

  constructor(
    { socket, ios, authorizations, securityManager }: {
      socket: SocketCustom;
      ios: Server;
      authorizations: AuthorizationsInterface;
      securityManager: SecurityManager;
    },
    friendManager: FriendsManager,
    userManager: UserManager
  ) {
    this._ios = ios;
    this._socket = socket;
    this._authorizations = authorizations;
    this._securityManager = securityManager;

    this._friendManager = friendManager;
    this._usersManager = userManager;

    this.friendRequestListener();
    this.acceptFriendRequestListener();
    this.declineFriendRequestListener();
    this.deleteFriendListener();
    this.sendPrivaMessageListener();
    this.getConversationWithAFriendListener();
    this.getPrivateMessagesHistoryListener();
    this.loadMorePrivateMessagesListener();
  }

  async onConnect() {
    const friends = await this._friendManager.getUserFriends(this._socket);
    await this._usersManager.connectUser(this._socket, friends);
    await this._friendManager.getAllConversations(this._socket);
  }

  friendRequestListener() {
    this._socket.on(
      "friendRequest",
      listenerHandler(async (data: FriendsInterface, callback: Acknowledgment) => {
        await this._friendManager.sendFriendRequest(this._socket, data);
        callback({ status: "ok", message: "Demande d'ami envoyé" });
      }));
  }

  acceptFriendRequestListener() {
    this._socket.on(
      "acceptFriendRequest",
      listenerHandler(async (senderId: number, callback: Acknowledgment) => {
          await this._friendManager.acceptFriendRequest(this._socket, senderId);
          callback({ status: "ok", message: "" });
        }
      ));
  }

  declineFriendRequestListener() {
    this._socket.on("declineFriendRequest", async (senderId: number) => {
      try {
        await this._friendManager.declineFriendRequest(this._socket, senderId);
      } catch (e) {
        console.error(e);
      }
    });
  }

  deleteFriendListener() {
    this._socket.on(
      "deleteFriend",
      async (data: { friendId: number; privateRoomId: number }) => {
        try {
          await this._friendManager.deleteFriend(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  getConversationWithAFriendListener() {
    this._socket.on(
      "getConversationWithAFriend",
      async (data: { friendId: number; privateRoomId: number }) => {
        try {
          await this._friendManager.getConversationWithAFriend(
            this._socket,
            data
          );
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  sendPrivaMessageListener() {
    this._socket.on(
      "sendPrivateMessage",
      async (data: PrivateMessageInterface) => {
        try {
          await this._friendManager.sendPrivateMessage(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  getPrivateMessagesHistoryListener() {
    this._socket.on(
      "getPrivateMessagesHistory",
      async (privateRoomId: number) => {
        try {
          await this._friendManager.getPrivateMessages(
            this._socket,
            privateRoomId
          );
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  loadMorePrivateMessagesListener() {
    this._socket.on(
      "loadMorePrivateMessages",

      async (data: { id: number; messagesArrayLength: number, isBeginningConversation: boolean; }) => {
        try {
          await this._friendManager.loadMorePrivateMessages(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
}

export { FriendListener };
