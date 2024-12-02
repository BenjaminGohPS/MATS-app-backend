const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const Roles = require("../models/Roles");

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(400).json({ status: "error", msg: "not authorised" });
    }

    const users = await Auth.findAll();

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting users" });
  }
};

const register = async (req, res) => {
  try {
    const auth = await Auth.findOne({ email: req.body.email });
    if (auth) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    await Auth.create({
      email: req.body.email,
      password: hash,
      role: req.body.role || "USER",
    });

    res.json({ status: "ok", msg: "user created" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "invalid registration" });
  }
};

const login = async (req, res) => {
  try {
    const auth = await Auth.findOne({ email: req.body.email });

    if (!auth) {
      return res.status(400).json({ status: "error", msg: "not authorised" });
    }

    const result = await bcrypt.compare(req.body.password, auth.hash);
    if (!result) {
      console.error("email or password error");
      return res
        .status(400)
        .json({ status: "error", msg: "email or password error" });
    }

    const token = jwt.sign(
      { userId: auth.id, role: auth.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "login failed" });
  }
};

module.exports = { getAllUsers, register, login };
