import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

import sequelize from "../config/sequelize";
import Namespace from "./Namespace";
import User from "./User";

class UserHasNamespace extends Model<
  InferAttributes<UserHasNamespace>,
  InferCreationAttributes<UserHasNamespace>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare admin: CreationOptional<boolean>;
  declare namespaceId: ForeignKey<Namespace["id"]>;
  declare userId: ForeignKey<User["id"]>;
}

UserHasNamespace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },

    namespaceId: {
      type: DataTypes.INTEGER,
      field: "namespace_id",
    },

    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "user_has_namespace",
    timestamps: false,
  }
);

export default UserHasNamespace;
