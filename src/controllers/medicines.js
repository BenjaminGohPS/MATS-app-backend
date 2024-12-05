const { Op } = require("sequelize");
const Medicines = require("../models/Medicines");
const Auth = require("../models/Auth");

const getAllMedicines = async (rq, res) => {
  try {
    const medicines = await Medicines.findAll();

    if (!medicines) {
      return res
        .status(400)
        .json({ status: "error", msg: "user has no medicines" });
    }
    res.json(medicines);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting medicines" });
  }
};

module.exports = { getAllMedicines };
