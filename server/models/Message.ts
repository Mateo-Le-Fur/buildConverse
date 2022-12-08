const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Message extends Model {
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    data: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    dataType: {
      type: DataTypes.ENUM("text", "image", "file"),
      allowNull: false,
      default: "text",
      field: "data_type"
    },

    authorName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "author_name"
    },

    avatarAuthor: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "avatar_author"
    }
  },
  {
    sequelize,
    tableName: "message"
  }
);

export default Message;
