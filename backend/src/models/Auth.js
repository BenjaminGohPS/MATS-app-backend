const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Role = require("./Roles");

const Auth = sequelize.define("Auth", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: "Please provide a valid email address",
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [10, 128],
        msg: "Password must be at least 10 characters long",
      },
      matches: {
        args: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
        msg: "Password must contain at least one uppercase letter and one symbol",
      },
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "USER",
  },
});

Auth.belongsTo(Role, {
  foreignKey: {
    allowNull: false,
  },
});

Role.hasMany(Auth, { foreignKey: { allowNull: false } });

module.exports = Auth;
