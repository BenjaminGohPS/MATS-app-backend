const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const Roles = sequelize.define("Role", {
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

// syncRoleTable();
sequelize.sync();

module.exports = Role;
