const express = require("express");
const router = express.Router();
const {
  getAllMedicines,
  getMedicineByUserId,
  addMedicine,
  deleteMedicine,
  updateMedicine,
} = require("../controllers/medicines");
const { auth } = require("../middleware/auth");

// medicines
router.get("/meds", auth, getAllMedicines);
router.get("/meds/:id", auth, getMedicineByUserId);
router.put("/meds", auth, addMedicine);
router.delete("/meds", auth, deleteMedicine);
router.patch("/meds/:id", auth, updateMedicine);

module.exports = router;
