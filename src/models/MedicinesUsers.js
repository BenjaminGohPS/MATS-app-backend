const { Sequelize, DataTypes, UUID } = require("sequelize");
const sequelize = require("../db/db");
const Medicines = require("./Medicines");
const Auth = require("./Auth");

const MedicineUsers = sequelize.define("Medicines_Users", {
  medicine_id: {
    type: UUID,
    references: {
      model: Medicines,
      key: "medicine_id",
    },
  },
  user_id: {
    type: UUID,
    references: {
      model: Auth,
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  daily_dosage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  start_date: {
    type: DataTypes.STRING,
  },
  end_date: {
    type: DataTypes.STRING,
  },
});

MedicineUsers.primaryKey = ["medicine_id", "user_id"];

module.exports = MedicineUsers;
