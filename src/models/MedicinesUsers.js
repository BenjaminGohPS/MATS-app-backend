const { Sequelize, DataTypes, UUID } = require("sequelize");
const { sequelize } = require("../db/db");
const Medicines = require("./Medicines");
const Auth = require("./Auth");

const MedicineUsers = sequelize.define("medicines_users", {
  medicine_id: {
    type: UUID,
    references: {
      model: Medicines,
      key: "medicine_id",
    },
    primaryKey: true,
  },
  user_id: {
    type: UUID,
    references: {
      model: Auth,
      key: "id",
    },
    primaryKey: true,
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



// In Medicines model
Medicines.hasMany(MedicineUsers, { foreignKey: "medicine_id" });
MedicineUsers.belongsTo(Medicines, { foreignKey: "medicine_id" });

// In Auth model (User model)
Auth.hasMany(MedicineUsers, { foreignKey: "user_id" });
MedicineUsers.belongsTo(Auth, { foreignKey: "user_id" });

module.exports = MedicineUsers;
