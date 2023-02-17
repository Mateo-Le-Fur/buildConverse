import { Server } from "socket.io";
import {
  FriendsInterface,
  PrivateMessageInterface,
  SocketCustom,
} from "../interfaces";
import { FriendsManager } from "../sockets/friend.socket";
import { UserManager } from "../sockets/user.socket";

class FriendListener {
  private _ios: Server;
  private _socket: SocketCustom;
  private _friendsManager: FriendsManager;
  private _usersManager: UserManager;
  constructor(socket: SocketCustom, ios: Server, clients: Map<number, string>) {
    this._friendsManager = new FriendsManager(ios, clients);
    this._usersManager = new UserManager(ios, clients);
    this._ios = ios;
    this._socket = socket;

    this.friendRequest();
    this.acceptFriendRequest();
    this.declineFriendRequest();
    this.deleteFriend();
    this.sendPrivaMessage();
    this.getConversationWithAFriend();
    this.getPrivateMessagesHistory();
    this.loadMorePrivateMessages();
  }

  async onConnect() {
    const friends = await this._friendsManager.getUserFriends(this._socket);
    await this._usersManager.connectUser(this._socket, friends);
    await this._friendsManager.getAllConversations(this._socket);
  }

  friendRequest() {
    this._socket.on(
      "friendRequest",
      async (data: FriendsInterface, callback) => {
        console.log("friend request");
        try {
          await this._friendsManager.friendRequest(this._socket, data);
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
  acceptFriendRequest() {
    this._socket.on(
      "acceptFriendRequest",
      async (senderId: number, callback) => {
        try {
          await this._friendsManager.acceptFriendRequest(
            this._socket,
            senderId
          );
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
  declineFriendRequest() {
    this._socket.on("declineFriendRequest", async (senderId: number) => {
      try {
        await this._friendsManager.declineFriendRequest(this._socket, senderId);
      } catch (e) {
        console.error(e);
      }
    });
  }
  deleteFriend() {
    this._socket.on(
      "deleteFriend",
      async (data: { friendId: number; privateRoomId: number }) => {
        try {
          await this._friendsManager.deleteFriend(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  getConversationWithAFriend() {
    this._socket.on(
      "getConversationWithAFriend",
      async (data: { friendId: number; privateRoomId: number }) => {
        try {
          await this._friendsManager.getConversationWithAFriend(
            this._socket,
            data
          );
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  sendPrivaMessage() {
    this._socket.on(
      "sendPrivateMessage",
      async (data: PrivateMessageInterface) => {
        try {
          await this._friendsManager.sendPrivateMessage(this._socket, data);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }

  getPrivateMessagesHistory() {
    this._socket.on(
      "getPrivateMessagesHistory",
      async (privateRoomId: number) => {
        try {
          await this._friendsManager.getPrivateMessages(
            this._socket,
            privateRoomId
          );
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
  loadMorePrivateMessages() {
    this._socket.on(
      "loadMorePrivateMessages",
      async (data: { id: number; messagesArrayLength: number }) => {
        try {
          await this._friendsManager.loadMorePrivateMessages(
            this._socket,
            data
          );
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
}

export { FriendListener };
