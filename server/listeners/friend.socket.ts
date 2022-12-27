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
import { RecipientInterface } from "../interfaces/RecipientInterface";
import { SenderInterface } from "../interfaces/SenderInterface";

class FriendsManager {
  private _ios: Server;
  private _clients: Map<number, string>;

  constructor(ios: Server, clients: Map<number, string>) {
    this._ios = ios;
    this._clients = clients;
  }

  public async getUserFriends(socket: SocketCustom) {
    const userId = socket.request.user?.id;

    const foundUserFriends: FriendsInterface | undefined = (
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

    friends = friends?.map((friend) => {
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

    socket.emit("friends", merge);
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
      sender_id: userId,
      recipient_id: foundUser.id,
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
        sender_id: senderId,
      },
    });

    await Friend.create({
      user1_id: userId,
      user2_id: senderId,
    });

    await Friend.create({
      user1_id: senderId,
      user2_id: userId,
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

      this._ios.to(socketId).emit("friendRequestAccepted", user);
    }

    socket.emit("acceptFriendRequest", friend);
  }

  public async declineFriendRequest(socket: SocketCustom, senderId: number) {
    await FriendRequest.destroy({
      where: {
        sender_id: senderId,
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
          user_id: userId,
        },
      })
    )
      .map((el: UserHasPrivateRoom) => el.toJSON())
      .filter((el: UserHasPrivateRoom) => el.active === true);

    if (recipients.length) {
      const promises = await Promise.all(
        recipients.map(async (recipient: RecipientInterface) => {
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

          return data?.toJSON();
        })
      );

      const result = promises.map((element) => {
        const users = element.privateRoomUsers;

        const filteredUser = users.find(
          (user: UserInterface) => user.id !== userId
        );

        if (filteredUser) {
          return {
            ...filteredUser,
            avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
              filteredUser.id
            }/${Date.now()}/avatar`,
            privateRoomId: element.id,
          };
        }
      });

      const t1 = performance.now();

      console.log(t1 - t0);

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
        user1_id: data.friendId,
        user2_id: userId,
      },
    });

    await Friend.destroy({
      where: {
        user1_id: userId,
        user2_id: data.friendId,
      },
    });

    const socketId = this._clients.get(data.friendId);

    if (socketId) this._ios.to(socketId).emit("deleteFriend", userId);

    socket.emit("deleteFriend", data.friendId);
  }

  public async getOrCreateConversationWithAFriend(
    socket: SocketCustom,
    data: { friendId: number; privateRoomId: number }
  ) {
    const userId = socket.request.user?.id;

    const checkIfFriendExist = await User.findByPk(data.friendId);

    if (!checkIfFriendExist) return;

    const recipientRooms = (
      await UserHasPrivateRoom.findAll({
        where: {
          user_id: data.friendId,
        },
      })
    ).map((el: UserHasPrivateRoom) => el.toJSON());

    const senderRooms = (
      await UserHasPrivateRoom.findAll({
        where: {
          user_id: userId,
        },
      })
    ).map((el: UserHasPrivateRoom) => el.toJSON());

    const checkIfConversationAlreadyCreated = senderRooms.filter(
      (sender: SenderInterface) => {
        return recipientRooms.some((recipient: RecipientInterface) => {
          return sender.privateRoomId === recipient.privateRoomId;
        });
      }
    );

    let recipient = await PrivateRoom.findOne({
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
        id:
          data.privateRoomId ??
          checkIfConversationAlreadyCreated[0]?.privateRoomId ??
          -1,
      },
      raw: true,
      nest: true,
    });

    if (!recipient) {
      const privateRoom = (await PrivateRoom.create()).get();

      await UserHasPrivateRoom.create({
        user_id: userId,
        private_room_id: privateRoom.id,
      });

      await UserHasPrivateRoom.create({
        user_id: data.friendId,
        private_room_id: privateRoom.id,
      });

      let recipientCreated = await PrivateRoom.findOne({
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
          id: privateRoom.id,
        },
        raw: true,
        nest: true,
      });

      recipientCreated = {
        ...recipientCreated.privateRoomUsers,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          recipientCreated.privateRoomUsers?.id
        }/${Date.now()}/avatar`,
        privateRoomId: recipientCreated.id,
      };

      socket.emit("getConversationWithAFriend", recipientCreated);
      return;
    }

    const [{ active, privateRoomId }] = [...senderRooms];

    if (!active) {
      await UserHasPrivateRoom.update(
        {
          active: true,
        },
        {
          where: {
            user_id: userId,
            private_room_id: privateRoomId,
          },
        }
      );
    }

    recipient = {
      ...recipient.privateRoomUsers,
      avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
        recipient.privateRoomUsers?.id
      }/${Date.now()}/avatar`,
      privateRoomId: recipient.id,
    };

    socket.emit("getConversationWithAFriend", recipient);

    const t1 = performance.now();

    console.log(t1 - t0);
  }

  public async getPrivateMessages(socket: SocketCustom, privateRoomId: number) {
    let messages = (
      await PrivateMessage.findAll({
        where: {
          private_room_id: privateRoomId,
        },
        order: [["created_at", "asc"]],
      })
    ).map((message: PrivateMessage) => message.toJSON());

    messages = messages.map((message: PrivateMessageInterface) => {
      return {
        ...message,
        avatarAuthor: `${process.env.DEV_AVATAR_URL}/user/${
          message.user_id
        }/${Date.now()}/avatar`,
      };
    });

    socket.emit("getPrivateMessagesHistory", messages);
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

    let message = (
      await PrivateMessage.create({
        data: data.data,
        dataType: "text",
        private_room_id: data.privateRoomId,
        user_id: userId,
        authorName: user?.pseudo,
        avatarAuthor: user?.avatarUrl,
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

export { FriendsManager };
