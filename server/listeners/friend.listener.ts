import { Server } from "socket.io";
import {
  FriendsInterface,
  PrivateMessageInterface,
  SocketCustom,
} from "../interfaces";
import { FriendsManager } from "../sockets/friend.socket";
import { UserManager } from "../sockets/user.socket";

class FriendListener extends FriendsManager {
  protected _ios: Server;
  protected _socket: SocketCustom;
  private _usersManager: UserManager;
  constructor(socket: SocketCustom, ios: Server, clients: Map<number, string>) {
    super(ios, clients);
    this._usersManager = new UserManager(ios, clients);
    this._ios = ios;
    this._socket = socket;

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
    const friends = await this.getUserFriends(this._socket);
    await this._usersManager.connectUser(this._socket, friends);
    await this.getAllConversations(this._socket);
  }

  friendRequestListener() {
    this._socket.on(
      "friendRequest",
      async (data: FriendsInterface, callback) => {
        console.log("friend request");
        try {
          await this.friendRequest(this._socket, data);
          callback({
            status: "ok",
            message: "Demande d'ami envoyé",
          });
        } catch (e) {
          if (e instanceof Error) {
            callback({
              status: "error",
              message: e.message,
            });
            console.error(e);
          }
        }
      }
    );
  }
  acceptFriendRequestListener() {
    this._socket.on(
      "acceptFriendRequest",
      async (senderId: number, callback) => {
        try {
          await this.acceptFriendRequest(this._socket, senderId);
          callback({
            status: "ok",
            message: "",
          });
        } catch (e) {
          if (e instanceof Error) {
            console.error(e);
            callback({
              status: "error",
              message: e.message,
            });
          }
        }
      }
    );
  }
  declineFriendRequestListener() {
    this._socket.on("declineFriendRequest", async (senderId: number) => {
      try {
        await this.declineFriendRequest(this._socket, senderId);
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
          await this.deleteFriend(this._socket, data);
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
          await this.getConversationWithAFriend(this._socket, data);
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
          await this.sendPrivateMessage(this._socket, data);
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
          await this.getPrivateMessages(this._socket, privateRoomId);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  loadMorePrivateMessagesListener() {
    this._socket.on(
      "loadMorePrivateMessages",
      async (data: { id: number; messagesArrayLength: number }) => {
        try {
          await this.loadMorePrivateMessages(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
}

export { FriendListener };
