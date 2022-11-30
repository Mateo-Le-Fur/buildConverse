const { User } = require("../models");
const ApiError = require("../errors/apiError");

const userController = {
  async deleteAccount(req, res) {
    const { id } = req.params;
    const { user } = req;

    if (Number(id) !== user.id) throw new ApiError("forbidden", 403);
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
