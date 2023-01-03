import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
} from "sequelize";
import Room from "./Room";
import User from "./User";

import sequelize from "../config/sequelize";
import PrivateRoom from "./PrivateRoom";

type DataType = "text" | "image" | "file" | "invitation";

class PrivateMessage extends Model<
  InferAttributes<PrivateMessage>,
  InferCreationAttributes<PrivateMessage>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare data: string;
  declare dataType: DataType;
  declare authorName: string;
  declare avatarAuthor: string;
  declare privateRoomId: ForeignKey<PrivateRoom["id"]>;
  declare userId: ForeignKey<User["id"]>;
}

PrivateMessage.init(
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

    privateRoomId: {
      type: DataTypes.INTEGER,
      field: "private_room_id",
    },

    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },
  },
  {
    sequelize,
    tableName: "private_message",
  }
);

export default PrivateMessage;
