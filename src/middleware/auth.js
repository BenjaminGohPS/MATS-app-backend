const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(400).json({ status: "error", msg: "token required" });
  }

  const token = req.headers.authorization.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      req.decoded = decoded;
      req.userId = decoded.userId;
      req.role_id = decoded.role_id;
      next();
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ status: "error", msg: "not authorised" });
    }
  } else {
    return res.status(403).json({ status: "error", msg: "you are forbidden" });
  }
};

const authAdmin = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(400).json({ status: "error", msg: "token required" });
  }

  const token = req.headers.authorization.replace("Bearer ", "");
  if (token) {
    try {
      console.log("Token in header:", token);
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      if (decoded.role_id === 1) {
        req.decoded = decoded;
        req.userId = decoded.userId;
        req.role_id = decoded.role_id;
        next();
      } else {
        throw new Error("not admin");
      }
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ status: "error", msg: "not authorised" });
    }
  } else {
    return res.status(403).json({ status: "error", msg: "you are forbidden" });
  }
};

module.exports = { auth, authAdmin };
