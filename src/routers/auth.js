const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  register,
  login,
} = require("../controllers/auth");

const { authAdmin } = require("../middleware/auth");

router.get("/users", authAdmin, getAllUsers); // authAdmin
router.put("/register", register);
router.post("/login", login);
router.put("/users/:id/role", authAdmin, updateUserRole);

module.exports = router;
