import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  Options,
  FindOptions,
} from "sequelize";
import sequelize from "../config/sequelize";
import { NamespaceInterface } from "../interfaces/Namespace";
import { RoomInterface } from "../interfaces/Room";
import { UserHasNamespaceInterface } from "../interfaces/UserHasNamespace";
import user from "./User";

class UserNamespace extends Model<Optional<NamespaceInterface, any>> {
  declare id: number;
  declare name: string;
  declare inviteCode: string;
  declare imgUrl: string;
  declare rooms: RoomInterface[];
  declare UserHasNamespace: UserHasNamespaceInterface;
  declare createdAt: string;
  declare updatedAt: string;
  declare getUsers: (
    opts:
      | Omit<FindOptions<Optional<NamespaceInterface, any>>, "where">
      | undefined
  ) => user[];
}

UserNamespace.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    inviteCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "invite_code",
    },

    imgUrl: {
      type: DataTypes.TEXT,
      field: "img_url",
    },
  },
  {
    sequelize,
    tableName: "namespace",
  }
);
export default UserNamespace;
