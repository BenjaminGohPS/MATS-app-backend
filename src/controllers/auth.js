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

const register = async (req, res) => {
  try {
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
    const auth = await Auth.findOne({ where: { email: req.body.email } });

    if (!auth) {
      return res.status(400).json({ status: "error", msg: "not authorised" });
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

// if not used, to delete
const refresh = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    const claims = { email: decoded.email, role: decoded.role };

    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "15d",
      jwtid: uuidv4(),
    });
    res.json({ access });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "refresh error" });
  }
};

module.exports = { getAllUsers, register, login };
