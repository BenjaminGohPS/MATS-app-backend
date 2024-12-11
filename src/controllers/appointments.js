const { Op } = require("sequelize");
const Appointments = require("../models/Appointments");
const Auth = require("../models/Auth");

const getAllAppointments = async (req, res) => {
  try {
    const userRole = req.role_id;
    const userIdFromQuery = req.query.user_id;

    if (userRole === 1) {
      const appointments = await Appointments.findAll({
        where: userIdFromQuery ? { user_id: userIdFromQuery } : {},
        include: [
          {
            model: Auth,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
      });
      return res.json(appointments);
    }

    const appointments = await Appointments.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Auth,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
      // order: [["appointment_date", "ASC"]],
    });

    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", msg: "error getting appointments" });
  }
};

const getAppointmentById = async (req, res) => {
  const appointmentId = req.params.id;
  const userId = req.userId;
  const userRole = req.role_id;

  try {
    const appointments = await Appointments.findByPk(appointmentId, {
      include: [
        {
          model: Auth,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
    });

    if (!appointments) {
      return res.status(400).json({
        status: "error",
        msg: "no appointment found",
      });
    }

    if (appointments.user_id !== userId && userRole !== 1) {
      return res.status(400).json({
        status: "error",
        msg: "not authorise to view this appointment",
      });
    }

    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", msg: "error getting appointments" });
  }
};

const addAppointment = async (req, res) => {
  const {
    appointment_date,
    appointment_time,
    location,
    type,
    doctor,
    user_id,
  } = req.body;
  const userId = req.userId;
  const userRole = req.role_id;

  try {
    if (userRole === 1) {
      if (!user_id) {
        return res.status(400).json({
          status: "error",
          msg: "ADMIN must assign USER ID for the appointment.",
        });
      }

      const newAppointment = await Appointments.create({
        appointment_date,
        appointment_time,
        location,
        type,
        doctor,
        user_id: user_id,
      });

      return res.json({
        status: "ok",
        msg: `Appointment added to USER: ${user_id} successfully`,
        data: newAppointment,
      });
    }

    if (userRole !== 1) {
      const newAppointment = await Appointments.create({
        appointment_date,
        appointment_time,
        location,
        type,
        doctor,
        user_id: userId,
      });

      return res.json({
        status: "ok",
        msg: "Appointment added successfully!",
        data: newAppointment,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  const appointmentId = req.body.id;
  const userId = req.userId;
  const userRole = req.role_id;
  try {
    const appointment = await Appointments.findByPk(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        msg: "no appointment found",
      });
    }

    if (appointment.user_id !== userId && userRole !== 1) {
      return res
        .status(400)
        .json({ status: "error", msg: "not authorise to delete appointment" });
    }

    await appointment.destroy();

    res.json({ status: "ok", msg: "appointment deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", msg: "error deleting appointment" });
  }
};

const updateAppointment = async (req, res) => {
  const {
    appointment_date,
    appointment_time,
    location,
    type,
    doctor,
    user_id,
  } = req.body;
  const appointmentId = req.params.id;
  const userId = req.userId;
  const userRole = req.role_id;

  try {
    const appointment = await Appointments.findByPk(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "error", msg: "no appointment found" });
    }

    if (appointment.user_id !== userId && userRole !== 1) {
      return res.status(400).json({
        status: "error",
        msg: "not authorise to update appointment",
      });
    }

    // fields to be updated
    appointment.appointment_date =
      appointment_date || appointment.appointment_date;
    appointment.appointment_time =
      appointment_time || appointment.appointment_time;
    appointment.location = location || appointment.location;
    appointment.type = type || appointment.type;
    appointment.doctor = doctor || appointment.doctor;

    if (userRole === 1) {
      appointment.user_id = user_id || appointment.user_id;
    }

    await appointment.save();

    res.json({ status: "ok", msg: "appointment updated successfully" });
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", msg: "error updating appointment" });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  addAppointment,
  deleteAppointment,
  updateAppointment,
};
