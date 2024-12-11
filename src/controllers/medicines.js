const { Op } = require("sequelize");
const Medicines = require("../models/Medicines");
const MedicineUsers = require("../models/MedicinesUsers");
const Auth = require("../models/Auth");
const { sequelize } = require("../db/db");

//admin only
const getAllMedicines = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.role_id;

    if (userRole === 1) {
      const medicines = await Medicines.findAll({
        include: [
          {
            model: MedicineUsers,
            as: "medicines_users",
            include: [
              {
                model: Auth,
                as: "user",
                attributes: ["id", "email"],
              },
            ],
          },
        ],
      });

      return res.json(medicines);
    }

    const medicines = await Medicines.findAll({
      include: [
        {
          model: MedicineUsers,
          as: "medicines_users",
          where: { user_id: userId },
          include: [
            {
              model: Auth,
              as: "user",
              attributes: ["id", "email"],
            },
          ],
        },
      ],
    });
    res.json(medicines);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting medicines" });
  }
};

const getMedicineByUserId = async (req, res) => {
  const userId = req.userId;
  const userRole = req.role_id;

  try {
    if (userRole === 1) {
      const medicines = await MedicineUsers.findAll({
        include: [
          {
            model: Medicines,
            attributes: ["medicine_name", "medicine_expiry"],
          },
          {
            model: Auth,
            attributes: ["id", "email"],
          },
        ],
      });

      return res.json(medicines);
    }

    const medicines = await MedicineUsers.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Medicines,
          attributes: ["medicine_name", "medicine_expiry"],
        },
      ],
    });

    if (!medicines) {
      return res
        .status(400)
        .json({ status: "error", msg: "no medicine found for user" });
    }

    return res.json({
      status: "ok",
      msg: "record retrived",
      data: medicines,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ status: "error", msg: "error retrieving medicines" });
  }
};

const addMedicine = async (req, res) => {
  const userId = req.userId;
  const userRole = req.role_id;
  const {
    medicine_name,
    medicine_expiry,
    quantity,
    daily_dosage,
    start_date,
    end_date,
  } = req.body;

  try {
    const existingMedicine = await Medicines.findOne({
      where: { medicine_name, medicine_expiry },
    });

    let medicine;
    if (!existingMedicine) {
      // creates a new medicine record if it doesn't exist
      medicine = await Medicines.create({
        medicine_name,
        medicine_expiry,
      });
    } else {
      medicine = existingMedicine;
    }

    // ADMIN
    if (userRole === 1) {
      const existingAssignment = await MedicineUsers.findOne({
        where: { user_id: req.body.user_id, medicine_id: medicine.medicine_id },
      });

      if (existingAssignment) {
        return res.status(400).json({
          status: "error",
          msg: "Medicine already assigned to this user",
        });
      }

      const newAssignment = await MedicineUsers.create({
        user_id: req.body.user_id,
        medicine_id: medicine.medicine_id,
        quantity,
        daily_dosage,
        start_date,
        end_date,
      });

      return res.json(newAssignment);
    }

    // USER
    const existingAssignment = await MedicineUsers.findOne({
      where: { user_id: userId, medicine_id: medicine.medicine_id },
    });

    if (existingAssignment) {
      return res.status(400).json({ status: "error", msg: "duplicate record" });
    }

    const newAssignment = await MedicineUsers.create({
      user_id: userId,
      medicine_id: medicine.medicine_id,
      quantity,
      daily_dosage,
      start_date,
      end_date,
    });

    return res.json(newAssignment);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error adding medicine" });
  }
};

const deleteMedicine = async (req, res) => {
  const userId = req.userId;
  const userRole = req.role_id;

  // user_id: req.body.user_id,
  try {
    // ADMIN
    if (userRole === 1) {
      const existingAssignment = await MedicineUsers.findOne({
        where: { medicine_id: req.body.medicine_id },
      });

      if (!existingAssignment) {
        return res
          .status(400)
          .json({ status: "error", msg: "no medicine found" });
      }

      if (userRole !== 1 && existingAssignment.user_id !== userId) {
        return res.status(400).json({
          status: "error",
          msg: "Not authorized to delete this medicine",
        });
      }

      await existingAssignment.destroy();
      await Medicines.destroy({
        where: { medicine_id: req.body.medicine_id },
      });

      return res.json({
        status: "ok",
        msg: "Medicine deleted successfully",
      });
    }

    // USER
    const existingAssignment = await MedicineUsers.findOne({
      where: { user_id: userId, medicine_id: req.body.medicine_id },
    });

    if (!existingAssignment) {
      return res.status(400).json({
        status: "error",
        msg: "no medicine found",
      });
    }

    await existingAssignment.destroy();
    await Medicines.destroy({
      where: { medicine_id: req.body.medicine_id },
    });

    return res.json({
      status: "ok",
      msg: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ status: "error", msg: "error deleting medicine" });
  }
};

const updateMedicine = async (req, res) => {
  const userId = req.userId;
  const userRole = req.role_id;
  const medicineId = req.params.id;
  const {
    medicine_name,
    medicine_expiry,
    quantity,
    daily_dosage,
    start_date,
    end_date,
    user_id,
  } = req.body;

  // this is to start a transaction
  const t = await sequelize.transaction();
  console.log("Medicine ID:", medicineId);
  console.log("User ID:", userId);

  try {
    // const medicine = await Medicines.findOne({
    //   where: { medicine_id: medicineId },
    //   transaction: t,
    // });

    const medicine = await Medicines.findOne({
      where: { medicine_id: medicineId },
    });
    // console.log("medicine.user_id:", medicine.medicines_users[0].user_id);
    if (!medicine) {
      return res
        .status(404)
        .json({ status: "error", msg: "no medicine found" });
    }

    // const medicineUser = await MedicineUsers.findByPk(medicineId);
    // console.log("this is medicineUser.user_id:", medicineUser.user_id);
    // if (!medicineUser) {
    //   return res
    //     .status(404)
    //     .json({ status: "error", msg: "no medicine found" });
    // }

    const effectiveUserId = userRole === 1 ? user_id : userId;

    const medicineUser = await MedicineUsers.findOne({
      where: { medicine_id: medicineId, user_id: effectiveUserId },
      transaction: t,
    });

    if (!medicineUser) {
      if (userRole === 1) {
        await MedicineUsers.create(
          {
            user_id: user_id,
            medicine_id: medicineId,
            quantity,
            daily_dosage,
            start_date,
            end_date,
          },
          { transaction: t }
        );

        await t.commit();
        return res.json({ status: "ok", msg: "Medicine update successfully!" });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "no medicine assignment found for this user.",
        });
      }
    }
    console.log("CHECKING for medicineUser.user_id", medicineUser.user_id);
    console.log("CHECKING for userId", userId);
    console.log("CHECKING for effectiveUserId", effectiveUserId);

    if (medicineUser.user_id !== userId && userRole !== 1) {
      return res.status(400).json({
        status: "error",
        msg: "Not authorized to update this medicine",
      });
    }

    // const effectiveUserId = userRole === 1 ? user_id : userId;

    // let effectiveUserId;

    // // For admin, use the user_id passed in the body. For users, use their own userId.
    // if (userRole === 1) {
    //   effectiveUserId = user_id; // Admin can assign to any user
    // } else {
    //   effectiveUserId = userId; // Regular user can only update their own record
    // }

    // const medicineUser = await MedicineUsers.findOne({
    //   where: { medicine_id: medicineId, user_id: effectiveUserId },
    //   transaction: t,
    // });

    // if (!medicineUser) {
    //   if (userRole === 1) {
    //     await MedicineUsers.create(
    //       {
    //         user_id: user_id,
    //         medicine_id: medicineId,
    //         quantity,
    //         daily_dosage,
    //         start_date,
    //         end_date,
    //       },
    //       { transaction: t }
    //     );

    //     await t.commit();
    //     return res.json({ status: "ok", msg: "Medicine update successfully!" });
    //   } else {
    //     return res.status(404).json({
    //       status: "error",
    //       msg: "no medicine assignment found for this user.",
    //     });
    //   }
    // }

    // if (userRole !== 1 && medicineUser.user_id !== userId) {
    //   return res.status(400).json({
    //     status: "error",
    //     msg: "Not authorized to update this medicine",
    //   });
    // }

    // fields to be updated
    medicine.medicine_name = medicine_name || medicine.medicine_name;
    medicine.medicine_expiry = medicine_expiry || medicine.medicine_expiry;
    medicineUser.quantity = quantity || medicine.quantity;
    medicineUser.daily_dosage = daily_dosage || medicine.daily_dosage;
    medicineUser.start_date = start_date || medicine.start_date;
    medicineUser.end_date = end_date || medicine.end_date;

    if (userRole === 1) {
      medicineUser.user_id = user_id || medicine.user_id;
    }

    await medicine.save({ transaction: t });
    await medicineUser.save({ transaction: t });

    // all or nothing. both above must be successfully saved, else nothing.
    await t.commit();

    res.json({ status: "ok", msg: "Medicine updated successfully" });
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "Error updating medicine" });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineByUserId,
  addMedicine,
  deleteMedicine,
  updateMedicine,
};

/* Workings

// below is working codes for admin. but cannot assign
// user now have problem

const updateMedicine = async (req, res) => {
  const userId = req.userId;
  const userRole = req.role_id;
  const medicineId = req.params.id;
  const {
    medicine_name,
    medicine_expiry,
    quantity,
    daily_dosage,
    start_date,
    end_date,
    user_id,
  } = req.body;

  // this is to start a transaction
  const t = await sequelize.transaction();
  console.log("Medicine ID:", medicineId);
  console.log("User ID:", userId);

  try {
    // const medicine = await Medicines.findOne({
    //   where: { medicine_id: medicineId },
    //   transaction: t,
    // });

    const medicine = await Medicines.findByPk(medicineId);

    if (!medicine) {
      return res
        .status(404)
        .json({ status: "error", msg: "no medicine found" });
    }

    if (medicine.user_id !== userId && userRole !== 1) {
      return res.status(400).json({
        status: "error",
        msg: "Not authorized to update this medicine",
      });
    }

    const medicineUser = await MedicineUsers.findByPk(medicineId);

    if (!medicineUser) {
      return res
        .status(404)
        .json({ status: "error", msg: "no medicine found" });
    }

    if (medicineUser.user_id !== userId && userRole !== 1) {
      console.log("this is medicineUser.user_id:", medicineUser.user_id);
      return res.status(400).json({
        status: "error",
        msg: "Not authorized to update this medicine",
      });
    }

    // const effectiveUserId = userRole === 1 ? user_id : userId;

    // let effectiveUserId;

    // // For admin, use the user_id passed in the body. For users, use their own userId.
    // if (userRole === 1) {
    //   effectiveUserId = user_id; // Admin can assign to any user
    // } else {
    //   effectiveUserId = userId; // Regular user can only update their own record
    // }

    // const medicineUser = await MedicineUsers.findOne({
    //   where: { medicine_id: medicineId, user_id: effectiveUserId },
    //   transaction: t,
    // });

    // if (!medicineUser) {
    //   if (userRole === 1) {
    //     await MedicineUsers.create(
    //       {
    //         user_id: user_id,
    //         medicine_id: medicineId,
    //         quantity,
    //         daily_dosage,
    //         start_date,
    //         end_date,
    //       },
    //       { transaction: t }
    //     );

    //     await t.commit();
    //     return res.json({ status: "ok", msg: "Medicine update successfully!" });
    //   } else {
    //     return res.status(404).json({
    //       status: "error",
    //       msg: "no medicine assignment found for this user.",
    //     });
    //   }
    // }

    // if (userRole !== 1 && medicineUser.user_id !== userId) {
    //   return res.status(400).json({
    //     status: "error",
    //     msg: "Not authorized to update this medicine",
    //   });
    // }

    // fields to be updated
    medicine.medicine_name = medicine_name || medicine.medicine_name;
    medicine.medicine_expiry = medicine_expiry || medicine.medicine_expiry;
    medicineUser.quantity = quantity || medicine.quantity;
    medicineUser.daily_dosage = daily_dosage || medicine.daily_dosage;
    medicineUser.start_date = start_date || medicine.start_date;
    medicineUser.end_date = end_date || medicine.end_date;

    if (userRole === 1) {
      medicineUser.user_id = user_id || medicine.user_id;
    }

    await medicine.save({ transaction: t });
    await medicineUser.save({ transaction: t });

    // all or nothing. both above must be successfully saved, else nothing.
    await t.commit();

    res.json({ status: "ok", msg: "Medicine updated successfully" });
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "Error updating medicine" });
  }
};

*/
