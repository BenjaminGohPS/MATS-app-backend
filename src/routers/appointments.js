const express = require("express");
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  addAppointment,
  deleteAppointment,
  updateAppointment,
} = require("../controllers/appointments");

const { auth, authAdmin } = require("../middleware/auth");

// appointments
router.get("/appts", auth, getAllAppointments);
router.get("/appts/:id", auth, getAppointmentById);
router.put("/appts", auth, addAppointment);
router.delete("/appts", auth, deleteAppointment);
router.patch("/appts/:id", auth, updateAppointment);

module.exports = router;
