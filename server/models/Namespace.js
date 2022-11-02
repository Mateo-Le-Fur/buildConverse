const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Namespace extends Model {}

Namespace.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    invite_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    img_url: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: "namespace",
  }
);

module.exports = Namespace;
