const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const Roles = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isIn: {
        args: [["USER", "ADMIN"]],
        msg: "Role must be either 'USER' or 'ADMIN'",
      },
    },
  },
});

module.exports = Roles;
