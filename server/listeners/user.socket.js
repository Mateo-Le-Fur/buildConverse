const { Namespace, User } = require("../models");
const user = {
  async getNamespaceUsers(nsSocket, namespace_id, clients) {
    try {
      console.time("hello");

      let userList = (
        await Namespace.findByPk(namespace_id, {
          include: [
            {
              model: User,
              as: "namespaceHasUsers",
              attributes: {
                exclude: ["password", "email", "created_at", "updated_at"],
              },
            },
          ],
        })
      ).toJSON();

      console.timeEnd("hello");

      userList = userList.namespaceHasUsers.map((element) => {
        const checkIfUserConnected = clients.get(element.id);

        return {
          ...element,
          status: checkIfUserConnected ? "online" : "offline",
        };
      });

      nsSocket.emit("userList", userList);
    } catch (e) {
      throw e;
    }
  },
};

module.exports = user;
