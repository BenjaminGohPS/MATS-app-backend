const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const { v4: uuidv4 } = require("uuid");

const getAllUsers = async (req, res) => {
  try {
    const users = await Auth.findAll();

    const outputArray = [];
    for (const user of users) {
      outputArray.push({
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      });
    }

    res.json(outputArray);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, newRoleId } = req.body;

    const user = await Auth.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: "error", msg: "User not found." });
    }

    if (![1, 2].includes(newRoleId)) {
      return res.status(400).json({ status: "error", msg: "Invalid role ID" });
    }

    if (userId === req.userId) {
      return res
        .status(400)
        .json({ status: "error", msg: "You cannot update your own role" });
    }

    user.role_id = newRoleId;
    await user.save();

    res.json({ status: "success", msg: "User role updated successfully" });
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", msg: "Failed to update user role" });
  }
};

const register = async (req, res) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res
        .status(400)
        .json({ status: "error", msg: "invalid email format" });
    }

    const auth = await Auth.findOne({ where: { email: req.body.email } });

    if (auth) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }

    const hash = await bcrypt.hash(req.body.password, 12);

    await Auth.create({
      email: req.body.email,
      password: hash,
    });

    res.json({ status: "ok", msg: "user created" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "invalid registration" });
  }
};

const login = async (req, res) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res
        .status(400)
        .json({ status: "error", msg: "invalid email format" });
    }

    const auth = await Auth.findOne({ where: { email: req.body.email } });

    if (!auth) {
      return res
        .status(404)
        .json({ status: "error", msg: "Email not registered" });
    }

    const result = await bcrypt.compare(req.body.password, auth.password);
    if (!result) {
      console.error("email or password error");
      return res
        .status(400)
        .json({ status: "error", msg: "email or password error" });
    }

    const claims = {
      userId: auth.id,
      email: auth.email,
      role_id: auth.role_id,
    };

    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "15h",
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
      expiresIn: "15d",
      jwtid: uuidv4(),
    });

    res.json({ access, refresh });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "login failed" });
  }
};

module.exports = { getAllUsers, updateUserRole, register, login };
