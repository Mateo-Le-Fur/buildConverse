import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  Options,
  FindOptions,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/sequelize";
import { NamespaceInterface } from "../interfaces/Namespace";
import { RoomInterface } from "../interfaces/Room";
import { UserHasNamespaceInterface } from "../interfaces/UserHasNamespace";
import { UserInterface } from "../interfaces/User";

class Namespace extends Model<
  InferAttributes<Namespace>,
  InferCreationAttributes<Namespace>
> {
  declare id: CreationOptional<ForeignKey<any>>;
  declare name: string;
  declare inviteCode: string;
  declare imgUrl: string;
  declare rooms?: RoomInterface[];
  declare UserHasNamespace?: UserHasNamespaceInterface;
  declare users?: UserInterface[];
  declare getUsers: (
    opts:
      | Omit<FindOptions<Optional<NamespaceInterface, any>>, "where">
      | undefined
  ) => UserInterface[];
}

Namespace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

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
export default Namespace;
