const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Room extends Model {}

Room.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    namespaceId: {
      type: DataTypes.INTEGER,
      field: "namespace_id"
    },

    index: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "room",
  }
);

export default Room;
