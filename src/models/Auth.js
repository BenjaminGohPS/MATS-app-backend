const { DataTypes, UUID, UUIDV4 } = require("sequelize");
const { sequelize } = require("../db/db");
const Roles = require("./Roles");

const Auth = sequelize.define("users", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
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
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Roles,
      key: "id",
    },
    defaultValue: 2, // Assuming 'USER' has ID = 2, adjust if necessary
  },
});

// Associations
Auth.belongsTo(Roles, { foreignKey: "role_id" }); // Associate Auth with Role

module.exports = Auth;
