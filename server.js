require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const { connectDB } = require("./src/db/db");

const auth = require("./src/routers/auth");
const appts = require("./src/routers/appointments");
const meds = require("./src/routers/medicines");

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/MATS", auth);
app.use("/MATS", appts);
app.use("/MATS", meds);

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.originalUrl}`); // Logs the request method and URL
//   next(); // Passes the request to the next middleware
// });

// Test Route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
