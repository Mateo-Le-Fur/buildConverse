const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class UserHasNamespace extends Model {}

UserHasNamespace.init(
  {

    userId: {
      type: DataTypes.INTEGER,
      field: "user_id"
    },

    namespaceId: {
      type: DataTypes.INTEGER,
      field: "namespace_id"
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
