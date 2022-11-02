const { User, Message, Room, Namespace } = require("../models");

const test = {
  async getUsers(req, res) {
    const users = await User.findAll();

    res.json(users);
  },
};

module.exports = test;
