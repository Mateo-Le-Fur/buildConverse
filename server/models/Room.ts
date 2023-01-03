import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
} from "sequelize";
import Namespace from "./Namespace";

import sequelize from "../config/sequelize";

class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare name: string;
  declare index: number;
  declare namespaceId: ForeignKey<Namespace["id"]>;
}

Room.init(
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

    namespaceId: {
      type: DataTypes.INTEGER,
      field: "namespace_id",
    },

    index: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "room",
  }
);

export default Room;
