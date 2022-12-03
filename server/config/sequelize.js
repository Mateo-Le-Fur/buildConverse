const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("postgres://chat:MuvzH6712Hg@@localhost/chat", {
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },

  // benchmark: true,
  logging: false,
});

module.exports = sequelize;
