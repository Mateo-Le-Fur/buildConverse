const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class User extends Model {}

User.init(
  {
    pseudo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: DataTypes.TEXT,

    avatar_url: DataTypes.TEXT,

    description: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: "user",
  }
);

module.exports = User;
