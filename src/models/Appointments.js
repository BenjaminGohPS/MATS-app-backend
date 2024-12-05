const { Sequelize, DataTypes, UUID } = require("sequelize");
const { sequelize } = require("../db/db");
const Auth = require("./Auth");

const Appointments = sequelize.define("appointments", {
  appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointment_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appointment_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  doctor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id: {
    type: UUID,
    references: {
      model: Auth,
      key: "id",
    },
  },
});

Appointments.belongsTo(Auth, { foreignKey: "user_id" });

module.exports = Appointments;

/*
WORKINGS
CREATE TABLE appointments (
	appointment_id SERIAL PRIMARY KEY,
	appointment_date DATE NOT NULL, // for now varchar
	appointment_time TIME NOT NULL, // for now varchar
	location VARCHAR(255),
	type VARCHAR(255),
	doctor VARCHAR(255),
	user_id UUID REFERENCES Users(id)
);

*/
