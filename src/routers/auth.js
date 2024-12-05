const express = require("express");
const router = express.Router();

const { getAllUsers, register, login } = require("../controllers/auth");

const { authAdmin } = require("../middleware/auth");

router.get("/users", authAdmin, getAllUsers); // authAdmin
router.put("/register", register);
router.post("/login", login);

module.exports = router;
