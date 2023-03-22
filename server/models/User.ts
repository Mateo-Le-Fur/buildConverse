import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/sequelize";
import Friend from "./Friend";
import { FriendsInterface } from "../interfaces/FriendsInterface";
import { NamespaceInterface } from "../interfaces/Namespace";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare pseudo: string;
  declare email: string;
  declare password?: string;
  declare description: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare avatarUrl: string;
  declare friends?: FriendsInterface[];
  declare friendsRequests?: FriendsInterface[];
  declare pendingRequests?: FriendsInterface[];
  declare namespaces?: NamespaceInterface[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

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

    avatarUrl: {
      type: DataTypes.TEXT,
      field: "avatar_url",
    },

    description: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: "user",
  }
);

export default User;
