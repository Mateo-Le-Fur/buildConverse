const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("postgres://chat:chat@localhost/chat", {
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },

  logging: false,
});

module.exports = sequelize;
