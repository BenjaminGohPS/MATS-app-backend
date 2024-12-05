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

      console.log({ decoded });

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

//WORKINGS
// const Roles = require("../models/Roles"); // Assuming Roles is in the models directory

// // Middleware to authenticate users (JWT validation)
// const auth = (req, res, next) => {
//   const token = req.headers.authorization?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ status: "error", msg: "Token required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET); // Verify the JWT
//     req.user = decoded; // Attach the decoded JWT data to the request object (can access it in controllers)
//     next();
//   } catch (error) {
//     console.error(error.message);
//     return res.status(401).json({ status: "error", msg: "Invalid token" });
//   }
// };

// // Middleware to check if the user is an Admin
// const authAdmin = (req, res, next) => {
//   const token = req.headers.authorization?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ status: "error", msg: "Token required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET); // Verify the JWT

//     // Check if the user is an admin (assuming role_id 1 = Admin, 2 = User)
//     if (decoded.role_id === "1") {
//       req.user = decoded;
//       next();
//     } else {
//       return res
//         .status(403)
//         .json({ status: "error", msg: "Admin access required" });
//     }
//   } catch (error) {
//     console.error(error.message);
//     return res.status(401).json({ status: "error", msg: "Invalid token" });
//   }
// };

// // Middleware to ensure that the user can only access their own data
// const authUserOwnData = (req, res, next) => {
//   const token = req.headers.authorization?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ status: "error", msg: "Token required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET); // Verify the JWT

//     // Check if the user is trying to access their own data (match user ID)
//     if (decoded.id === req.params.id) {
//       req.user = decoded;
//       next();
//     } else {
//       return res
//         .status(403)
//         .json({ status: "error", msg: "You can only access your own data" });
//     }
//   } catch (error) {
//     console.error(error.message);
//     return res.status(401).json({ status: "error", msg: "Invalid token" });
//   }
// };

// // Export the middlewares for use in routes
// module.exports = { auth, authAdmin, authUserOwnData };
