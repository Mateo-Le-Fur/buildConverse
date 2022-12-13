import { Server } from "socket.io";
import { User, FriendRequest } from "../models";
import { SocketCustom } from "../interfaces/SocketCustom";
import { FriendsInterface } from "../interfaces/FriendsInterface";
import { UserInterface } from "../interfaces/User";
import Friend from "../models/Friend";

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
}

export { FriendsManager };
