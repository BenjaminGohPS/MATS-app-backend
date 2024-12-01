require("dotenv").config({ path: './.env' });
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database has been established successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();
