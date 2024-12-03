const { Sequelize, DataTypes, UUID, UUIDV4 } = require("sequelize");
const sequelize = require("../db/db");

const Medicines = sequelize.define("medicines", {
  medicine_id: {
    types: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  medicine_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  medicine_expiry: {
    type: DataTypes.STRING,
  },
});

module.exports = Medicines;
