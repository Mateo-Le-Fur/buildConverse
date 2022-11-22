const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class UserHasNamespace extends Model {}

UserHasNamespace.init(
  {
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

module.exports = UserHasNamespace;
