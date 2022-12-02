const { User, Namespace } = require("../models");
const fs = require("fs");
const path = require("path");
const runService = require("../services/runService");
const user = {
  async updateUser(socket, ios, data) {
    console.log(data);
    try {
      const avatar_name = data.avatarName ? Date.now() : null;

      if (data.avatar) {
        const t0 = performance.now();

        const buffer = await runService("./services/compressWorker.js", {
          data
        });

        fs.writeFileSync(
          path.join(__dirname, "../images/" + avatar_name),
          buffer,
          {
            encoding: "base64"
          }
        );

        const t1 = performance.now();

        console.log(`compression done : ${t1 - t0} ms`);
      }

      const { avatar_url: oldAvatar } = await User.findByPk(data.userId, {
        raw: true
      });

      await User.update(
        {
          pseudo: data.pseudo,
          email: data.email,
          description: data.description,
          avatar_url: data.avatar ? `/images/${avatar_name}` : oldAvatar
        },
        {
          where: {
            id: data.userId
          }
        }
      );

      if (!data.namespaces.length) {
        socket.emit("updateUser", "update user");
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
                "updated_at"
              ]
            },
            include: [
              {
                model: User,
                as: "namespaceHasUsers",
                attributes: {
                  exclude: ["password", "email", "created_at", "updated_at"]
                },

                where: {
                  id: data.userId
                }
              }
            ]
          })
        ).toJSON();

        user = user.namespaceHasUsers.map((element) => {
          const buffer = fs.readFileSync(
            path.join(__dirname, `..${element.avatar_url}`),
            {
              encoding: "base64"
            }
          );

          return {
            ...element,
            avatar_url: buffer,
            status: "online"
          };
        });

        ios.of(ns).emit("updateUser", ...user);
      }
    } catch (e) {
      console.error(e);
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


    namespaces.forEach((ns) => {
      ios.of(`/${ns}`).emit("userConnect", { id });
    });
  },

  disconnectUser(socket, ios, data) {
    const { namespaces } = data;
    const { id } = socket.request.user;

    namespaces.forEach((ns) => {
      ios.of(`/${ns}`).emit("userDisconnect", { id });
    });
  }
};

module.exports = user;
