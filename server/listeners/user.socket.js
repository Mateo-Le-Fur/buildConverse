const { User, Namespace } = require("../models");
const fs = require("fs");
const path = require("path");
const runService = require("../services/runService");

const user = {
  async updateUser(socket, ios, data) {
    const avatar_name = data.avatarName
      ? `${socket.request.user.id}-${Date.now()}`
      : null;

    console.log(avatar_name);

    if (data.avatar) {
      const t0 = performance.now();

      await runService("./services/compressWorker.js", {
        data,
        avatar_name,
      });

      const t1 = performance.now();

      console.log(`compression done : ${t1 - t0} ms`);
    }

    const { avatar_url: oldAvatar } = await User.findByPk(data.userId, {
      raw: true,
    });

    await User.update(
      {
        pseudo: data.pseudo,
        email: data.email,
        description: data.description,
        avatar_url: data.avatar ? `/images/${avatar_name}` : oldAvatar,
      },
      {
        where: {
          id: data.userId,
        },
      }
    );

    if (!data.namespaces.length) {
      socket.emit("updateUser", "update user");
      return;
    }

    for await (const ns of data.namespaces) {
      let user = (
        await Namespace.findByPk(ns, {
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
                id: data.userId,
              },
            },
          ],
        })
      ).toJSON();

      user = user.users.map((element) => {
        return {
          ...element,
          avatar_url: `${process.env.DEV_AVATAR_URL}/user/${
            element.id
          }/${Date.now()}/avatar`,
          status: "online",
        };
      });

      ios.of(`/${ns}`).emit("updateUser", ...user);
    }

    /* Je parcours tout les namespaces de l'utilisateur et j'emit l'utilisateur mise a jour * sur chaque namespace */

    // const promises = [];
    //
    // data.namespaces.forEach((ns) => {
    //   const t0 = performance.now();
    //
    //   let user = Namespace.findByPk(ns, {
    //     attributes: {
    //       exclude: [
    //         "name",
    //         "invite_code",
    //         "img_url",
    //         "created_at",
    //         "updated_at",
    //       ],
    //     },
    //     include: [
    //       {
    //         model: User,
    //         as: "namespaceHasUsers",
    //         attributes: {
    //           exclude: ["password", "email", "created_at", "updated_at"],
    //         },
    //
    //         where: {
    //           id: data.userId,
    //         },
    //       },
    //     ],
    //
    //     raw: true,
    //     nest: true,
    //   });
    //
    //   promises.push(user);
    //
    //   const t1 = performance.now();
    //
    //   console.log(`time : ${t1 - t0} ms`);
    // });
    //
    // setTimeout(() => {
    //   Promise.all(promises).then((values) => {});
    // }, 1000);
    //
    // // values.forEach((ns) => {
    // //   ios.of(ns.id).emit("updateUser", [
    // //     {
    // //       ...ns.namespaceHasUsers,
    // //       status: "online",
    // //     },
    // //   ]);
    // // });
    // //
    // // const t1 = performance.now();
    // //
    // // console.log(`time : ${t1 - t0} ms`);
  },

  async deleteUser(socket, ios, data) {
    const { id, namespacesId } = data;

    for (let nsId of namespacesId) {
      ios.of(`/${nsId}`).emit("deleteUser", { id });
    }
  },

  connectUser(socket, ios, data) {
    const { namespaces } = data;
    const { id } = socket.request.user;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        ios.of(`/${ns}`).emit("userConnect", { id });
      });
    }
  },

  disconnectUser(socket, ios, data) {
    const { namespaces } = data;
    const { id } = socket.request.user;

    namespaces.forEach((ns) => {
      ios.of(`/${ns}`).emit("userDisconnect", { id });
    });
  },
};

module.exports = user;
