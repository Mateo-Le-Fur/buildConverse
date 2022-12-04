const { User } = require("../models");
const ApiError = require("../errors/apiError");
const fs = require("fs");
const path = require("path");

const userController = {

  async getUserAvatar(req, res) {

    const { id } = req.params;

    const user = await User.findByPk(id, { raw: true });

    res.sendFile(path.join(__dirname, `..${user.avatar_url}.webp`));
  },

  async deleteAccount(req, res) {
    // const io = req.app.get("socketio");

    const { id } = req.params;
    if (Number(id) !== req.user.id) throw new ApiError("forbidden", 403);

    const user = await User.findByPk(id, { raw: true });

    if (user.avatar_url !== "/images/default-avatar.webp") {
      fs.unlinkSync(path.join(__dirname, `..${user.avatar_url}.webp`));
    }

    await User.destroy({
      where: {
        id
      }
    });

    res.clearCookie("jwt");

    res.end();
  }
};

module.exports = userController;
