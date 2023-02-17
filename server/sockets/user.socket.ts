import {
  PrivateRoom,
  User,
  UserHasNamespace,
  UserHasPrivateRoom,
  UserNamespace,
} from "../models";
import runService from "../services/runService";
import { Server, Socket } from "socket.io";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";
import { DeleteUserInterface } from "../interfaces/DeleteUserInterface";
import { SocketCustom } from "../interfaces/SocketCustom";
import { UserInterface } from "../interfaces/User";
import sharp from "sharp";
import path from "path";
import fs from "fs";

class UserManager {
  protected _ios: Server;
  protected _clients: Map<number, string>;

  constructor(ios: Server, clients: Map<number, string>) {
    this._ios = ios;
    this._clients = clients;
  }

  public async updateUser(socket: SocketCustom, data: UpdateUserInterface) {
    const userId = socket.request.user?.id;

    const avatarName = data.imgBuffer ? `${userId}-${Date.now()}` : null;

    if (data.imgBuffer) {
      await sharp(data.imgBuffer)
        .resize(100, 100)
        .webp({
          quality: 80,
          effort: 0,
        })
        .toFile(path.join(__dirname, `../images/${avatarName}.webp`));

      // await runService("./services/compressWorker.js", {
      //   data,
      //   avatarName
      // });
    }

    const { avatarUrl: oldAvatar } = (await User.findByPk(userId, {
      raw: true,
    })) as User;

    await User.update(
      {
        pseudo: data.pseudo,
        email: data.email,
        description: data.description,
        avatarUrl: data.imgBuffer ? `/images/${avatarName}` : oldAvatar,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    if (!data.namespaces.length && !data.friends.length) {
      socket.emit("updateUser", null);
      return;
    }

    if (data.namespaces.length) {
      await Promise.all(
        data.namespaces.map(async (ns) => {
          let namespace = (
            await UserNamespace.findByPk(ns, {
              attributes: {
                exclude: [
                  "name",
                  "invite_code",
                  "img_url",
                  "created_at",
                  "updated_at",
                ],
              },
              include: [
                {
                  model: User,
                  as: "users",
                  attributes: {
                    exclude: ["password", "email", "created_at", "updated_at"],
                  },
                  where: {
                    id: userId,
                  },
                },
              ],
            })
          )?.toJSON();

          const user = namespace?.users?.map((element: UserInterface) => {
            if (element) {
              return {
                ...element,
                avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
                  element.id
                }/${Date.now()}/avatar`,
              };
            }
          });

          if (user) this._ios.of(`/${ns}`).emit("updateUser", user[0]);
        })
      );

      // for await (const ns of data.namespaces) {
      //   let namespace = (
      //     await UserNamespace.findByPk(ns, {
      //       attributes: {
      //         exclude: [
      //           "name",
      //           "invite_code",
      //           "img_url",
      //           "created_at",
      //           "updated_at",
      //         ],
      //       },
      //       include: [
      //         {
      //           model: User,
      //           as: "users",
      //           attributes: {
      //             exclude: ["password", "email", "created_at", "updated_at"],
      //           },
      //           where: {
      //             id: userId,
      //           },
      //         },
      //       ],
      //     })
      //   )?.toJSON();
      //
      //   const user = namespace?.users?.map((element: UserInterface) => {
      //     if (element) {
      //       return {
      //         ...element,
      //         avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
      //           element.id
      //         }/${Date.now()}/avatar`,
      //         status: "online",
      //       };
      //     }
      //   });
      //
      //   if (user) this._ios.of(`/${ns}`).emit("updateUser", user[0]);
      // }
    }

    if (data.friends.length) {
      const getUserUpdated = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
        raw: true,
      });

      const user = {
        ...getUserUpdated,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          getUserUpdated?.id
        }/${Date.now()}/avatar`,
      };

      data.friends.forEach((id) => {
        const socketId = this._clients.get(id);

        if (socketId) this._ios.to(socketId).emit("updateUser", user);
      });
    }
  }

  public async deleteUser(socket: SocketCustom, data: DeleteUserInterface) {
    const { id, namespacesId, privateRoomsId } = data;

    const userId = socket.request.user?.id;

    await Promise.all(
      privateRoomsId.map(async (id) => {
        const data = await UserHasPrivateRoom.findAll({
          where: {
            privateRoomId: id,
          },
          raw: true,
        });

        if (data.length <= 2) {
          await PrivateRoom.destroy({
            where: {
              id: data[0].privateRoomId,
            },
          });
        }
      })
    );

    const user = await User.findByPk(userId, { raw: true });

    if (user?.avatarUrl !== "/images/default-avatar") {
      fs.unlinkSync(path.join(__dirname, `..${user?.avatarUrl}.webp`));
    }

    await User.destroy({
      where: {
        id: userId,
      },
    });

    if (namespacesId.length) {
      for (let nsId of namespacesId) {
        this._ios.of(`/${nsId}`).emit("deleteUser", { id, nsId });
      }
    }
  }

  public async connectUser(
    socket: SocketCustom,
    friends: number[] | undefined
  ) {
    const userId = socket.request.user?.id;

    await User.update(
      {
        status: "online",
      },
      {
        where: {
          id: userId,
        },
      }
    );

    if (friends?.length) {
      friends.forEach((friendId) => {
        const socketId = this._clients.get(friendId);

        if (socketId) {
          this._ios.to(socketId).emit("userConnect", { id: userId });
        }
      });
    }
  }

  public async disconnectUser(socket: SocketCustom) {
    const userId = socket.request.user?.id;

    await User.update(
      {
        status: "offline",
      },
      {
        where: {
          id: userId,
        },
      }
    );

    const user = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: User,
          as: "friends",
          attributes: ["id"],
        },
      ],
    });

    if (user?.friends?.length) {
      user.friends.forEach((friend) => {
        const socketId = this._clients.get(friend.id);

        if (socketId) {
          this._ios.to(socketId).emit("userDisconnect", { id: userId });
        }
      });
    }
  }
}

export { UserManager };
