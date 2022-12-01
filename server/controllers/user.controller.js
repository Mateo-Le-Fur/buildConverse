const { User } = require("../models");
const ApiError = require("../errors/apiError");
const fs = require("fs");
const path = require("path");

const userController = {
  async deleteAccount(req, res) {
    // const io = req.app.get("socketio");

    const { id } = req.params;
    if (Number(id) !== req.user.id) throw new ApiError("forbidden", 403);

    const user = await User.findByPk(id, { raw: true });

    if (user.avatar_url !== "/images/default-avatar") {
      fs.unlinkSync(path.join(__dirname, `..${user.avatar_url}`));
    }

    await User.destroy({
      where: {
        id,
      },
    });

    res.clearCookie("jwt");

    res.end();
  },
};

module.exports = userController;
