const { db } = require("../config/database");
const { verifyToken } = require("../utils/token");
const { fail } = require("../utils/http");
const { verifyFirebaseIdToken } = require("../services/firebaseAuthService");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload?.userId) {
    const firebaseUser = await verifyFirebaseIdToken(token);
    if (!firebaseUser) return next(fail(401, "Unauthorized access", "UNAUTHORIZED"));

    const user = db.users.find((item) => item.firebaseUid === firebaseUser.uid || item.email === firebaseUser.email);
    if (!user) return next(fail(401, "User profile not found for Firebase token", "USER_PROFILE_NOT_FOUND"));

    req.user = user;
    return next();
  }

  const user = db.users.find((item) => item.id === payload.userId);
  if (!user) return next(fail(401, "Unauthorized access", "UNAUTHORIZED"));

  req.user = user;
  next();
}

module.exports = { authenticate };
