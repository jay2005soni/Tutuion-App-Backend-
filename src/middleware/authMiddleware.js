const { db } = require("../config/database");
const { verifyToken } = require("../utils/token");
const { fail } = require("../utils/http");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload?.userId) return next(fail(401, "Unauthorized access", "UNAUTHORIZED"));

  const user = db.users.find((item) => item.id === payload.userId);
  if (!user) return next(fail(401, "Unauthorized access", "UNAUTHORIZED"));

  req.user = user;
  next();
}

module.exports = { authenticate };
