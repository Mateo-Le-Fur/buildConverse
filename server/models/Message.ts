import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  EnumDataType,
} from "sequelize";

import sequelize from "../config/sequelize";
import User from "./User";
import Room from "./Room";

type DataType = "text" | "image" | "file" | "invitation";
class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare data: string;
  declare dataType: DataType;
  declare authorName: string;
  declare avatarAuthor: string;
  declare roomId: ForeignKey<Room["id"]>;
  declare userId: ForeignKey<User["id"]>;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    dataType: {
      type: DataTypes.ENUM("text", "image", "file", "invitation"),
      allowNull: false,
      field: "data_type",
    },

    authorName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "author_name",
    },

    avatarAuthor: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "avatar_author",
    },

    roomId: {
      type: DataTypes.INTEGER,
      field: "room_id",
    },

    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },
  },
  {
    sequelize,
    tableName: "message",
  }
);

export default Message;
