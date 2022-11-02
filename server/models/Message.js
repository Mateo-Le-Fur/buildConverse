const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Message extends Model {}

Message.init(
  {
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    data_type: {
      type: DataTypes.ENUM("text", "image", "file"),
      allowNull: false,
      default: "text",
    },

    author_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "message",
  }
);

module.exports = Message;
