import { Server } from "socket.io";
import {
  FriendRequest,
  PrivateMessage,
  PrivateRoom,
  User,
  UserHasPrivateRoom,
  Friend,
} from "../models";
import { SocketCustom } from "../interfaces/SocketCustom";
import { FriendsInterface } from "../interfaces/FriendsInterface";
import { PrivateMessageInterface } from "../interfaces/PrivateMessageInterface";
import { UserInterface } from "../interfaces/User";

class FriendsManager {
  private _ios: Server;
  private _clients: Map<number, string>;

  constructor(ios: Server, clients: Map<number, string>) {
    this._ios = ios;
    this._clients = clients;
  }

  public async getUserFriends(
    socket: SocketCustom
  ): Promise<number[] | undefined> {
    const userId = socket.request.user?.id;

    const foundUserFriends = (
      await User.findByPk(userId, {
        include: [
          {
            model: User,
            as: "friends",
            required: false,
            attributes: { exclude: ["password"] },
          },
          {
            model: User,
            as: "friendsRequests",
            required: false,
            attributes: { exclude: ["password"] },
          },
        ],
      })
    )?.toJSON();

    let friends = foundUserFriends?.friends;
    let friendsRequest = foundUserFriends?.friendsRequests;

    friends = friends?.map((friend: FriendsInterface) => {
      const checkIfUserIsOnline = this._clients.get(friend.id);

      return {
        ...friend,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          friend.id
        }/${Date.now()}/avatar`,
        status: checkIfUserIsOnline ? "online" : "offline",
      };
    });

    friendsRequest = friendsRequest?.map((friend) => {
      return {
        ...friend,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          friend.id
        }/${Date.now()}/avatar`,
        status: "pending",
      };
    });

    const merge = [
      // @ts-ignore
      ...friends,
      ...friendsRequest,
    ];

    const friendsId = friends?.map((friend) => friend.id);

    socket.emit("friends", merge);

    return friendsId;
  }

  public async friendRequest(socket: SocketCustom, data: FriendsInterface) {
    const userId = socket.request.user?.id;

    const foundUser = await User.findOne({
      where: {
        pseudo: data.pseudo,
      },
      raw: true,
    });

    if (!foundUser) throw new Error("Aucun utilisateur trouvé");

    await FriendRequest.create({
      senderId: userId,
      recipientId: foundUser.id,
    });

    const sender = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      raw: true,
    });

    if (sender) {
      sender.status = "pending";
      sender.avatarUrl = `${process.env.DEV_AVATAR_URL}/user/${
        sender.id
      }/${Date.now()}/avatar`;
    }

    const socketId = this._clients.get(foundUser.id);

    if (socketId) {
      this._ios.to(socketId).emit("friendRequest", sender);
    }
  }

  public async acceptFriendRequest(socket: SocketCustom, senderId: number) {
    const userId = socket.request.user?.id;

    await FriendRequest.destroy({
      where: {
        senderId: senderId,
        recipientId: userId,
      },
    });

    await Friend.create({
      user1Id: userId,
      user2Id: senderId,
    });

    await Friend.create({
      user1Id: senderId,
      user2Id: userId,
    });

    const privateRoom = (await PrivateRoom.create()).get();

    await UserHasPrivateRoom.create({
      userId: userId,
      privateRoomId: privateRoom.id,
    });

    await UserHasPrivateRoom.create({
      userId: senderId,
      privateRoomId: privateRoom.id,
    });

    const socketId = this._clients.get(senderId);

    const friend = {
      id: senderId,
      status: socketId ? "online" : "offline",
    };

    if (socketId) {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
        raw: true,
      });

      if (user) {
        user.status = "online";
        user.avatarUrl = `${
          process.env.DEV_AVATAR_URL
        }/user/${userId}/${Date.now()}/avatar`;
      }

      this._ios.to(socketId).emit("friendRequestAccepted", {
        ...user,
        privateRoomId: privateRoom.id,
        active: false,
      });
    }

    socket.emit("acceptFriendRequest", {
      ...friend,
      privateRoomId: privateRoom.id,
      active: false,
    });
  }

  public async declineFriendRequest(socket: SocketCustom, senderId: number) {
    await FriendRequest.destroy({
      where: {
        senderId: senderId,
      },
    });

    socket.emit("declineFriendRequest", senderId);
  }

  public async getAllConversations(socket: SocketCustom) {
    const t0 = performance.now();

    const userId = socket.request.user?.id;

    const recipients = (
      await UserHasPrivateRoom.findAll({
        where: {
          userId,
        },
      })
    ).map((el: UserHasPrivateRoom) => el.toJSON());

    if (recipients.length) {
      const promises = await Promise.all(
        recipients.map(async (recipient) => {
          const data = await PrivateRoom.findOne({
            include: [
              {
                model: User,
                as: "privateRoomUsers",
                attributes: { exclude: ["password"] },
              },
            ],
            where: {
              id: recipient.privateRoomId,
            },
          });

          return {
            ...data?.toJSON(),
            active: recipient.active,
          };
        })
      );

      const result = promises.map((element) => {
        const users = element.privateRoomUsers;

        const filteredUser = users?.find(
          (user: UserInterface) => user.id !== userId
        );

        if (filteredUser) {
          return {
            ...filteredUser,
            avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
              filteredUser.id
            }/${Date.now()}/avatar`,
            privateRoomId: element.id,
            active: element.active,
          };
        }
      });

      socket.emit("conversations", result);
    }
  }

  public async deleteFriend(
    socket: SocketCustom,
    data: { friendId: number; privateRoomId: number }
  ) {
    const userId = socket.request.user?.id;

    await Friend.destroy({
      where: {
        user1Id: data.friendId,
        user2Id: userId,
      },
    });

    await Friend.destroy({
      where: {
        user1Id: userId,
        user2Id: data.friendId,
      },
    });

    if (data.privateRoomId) {
      await PrivateRoom.destroy({
        where: {
          id: data.privateRoomId,
        },
      });
    }

    const socketId = this._clients.get(data.friendId);

    if (socketId)
      this._ios.to(socketId).emit("deleteFriend", {
        id: userId,
        privateRoomId: data.privateRoomId,
      });

    socket.emit("deleteFriend", {
      id: data.friendId,
      privateRoomId: data.privateRoomId,
    });
  }

  public async getConversationWithAFriend(
    socket: SocketCustom,
    data: { friendId: number; privateRoomId: number }
  ) {
    const userId = socket.request.user?.id;

    const checkIfFriendExist = await User.findByPk(data.friendId);

    if (!checkIfFriendExist) return;

    const userRoom = await UserHasPrivateRoom.findOne({
      where: {
        userId,
        privateRoomId: data.privateRoomId,
      },
      raw: true,
    });

    const privateRoom = (
      await PrivateRoom.findOne({
        include: [
          {
            model: User,
            as: "privateRoomUsers",
            attributes: { exclude: ["password"] },
            where: {
              id: data.friendId,
            },
          },
        ],
        where: {
          id: data.privateRoomId,
        },
      })
    )?.toJSON();

    if (!userRoom?.active) {
      await UserHasPrivateRoom.update(
        {
          active: true,
        },
        {
          where: {
            userId,
            privateRoomId: userRoom?.privateRoomId,
          },
        }
      );
    }

    if (privateRoom?.privateRoomUsers) {
      const getRecipient = privateRoom?.privateRoomUsers[0];

      const recipient = {
        ...getRecipient,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          getRecipient?.id
        }/${Date.now()}/avatar`,
        active: true,
        privateRoomId: getRecipient?.UserHasPrivateRoom.privateRoomId,
      };

      socket.emit("getConversationWithAFriend", recipient);
    }
  }

  public async getPrivateMessages(socket: SocketCustom, privateRoomId: number) {
    let messages = (
      await PrivateMessage.findAll({
        where: {
          privateRoomId: privateRoomId,
        },
        order: [["id", "desc"]],
        limit: 50,
      })
    ).map((message: PrivateMessage) => message.toJSON());

    messages = messages.map((message) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.userId
        }/${Date.now()}/avatar`,
      };
    });

    socket.emit("getPrivateMessagesHistory", messages);
  }

  public async loadMorePrivateMessages(
    socket: SocketCustom,
    data: {
      id: number;
      messagesArrayLength: number;
    }
  ) {
    let messages = (
      await PrivateMessage.findAll({
        where: {
          privateRoomId: data.id,
        },
        order: [["id", "desc"]],
        limit: 50,
        offset: data.messagesArrayLength,
      })
    ).map((message: PrivateMessage) => message.toJSON());

    messages = messages.map((message) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.userId
        }/${Date.now()}/avatar`,
      };
    });

    socket.emit("loadMorePrivateMessages", messages);
  }

  public async sendPrivateMessage(
    socket: SocketCustom,
    data: PrivateMessageInterface
  ) {
    const userId = socket.request.user?.id;

    const user = await User.findByPk(userId, {
      attributes: ["pseudo", ["avatar_url", "avatarUrl"]],
      raw: true,
    });

    if (user) {
      let message = (
        await PrivateMessage.create({
          data: data.data,
          dataType: "text",
          privateRoomId: data.privateRoomId,
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

      const socketId = this._clients.get(data.recipientId);

      if (socketId) {
        this._ios.to(socketId).emit("privateMessage", message);
      }

      socket.emit("privateMessage", message);
    }
  }
}

export { FriendsManager };
