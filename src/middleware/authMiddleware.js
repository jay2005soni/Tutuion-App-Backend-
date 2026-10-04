const {
  fail,
} = require("../utils/http");

const {
  verifyFirebaseIdToken,
} = require("../services/firebaseAuthService");

const {
  ensureUserProfile,
} = require("../services/userProfileService");


async function authenticate(
  req,
  res,
  next
) {
  try {
    const header =
      req.headers.authorization ||
      "";

    const token =
      header.startsWith("Bearer ")
        ? header.slice(7)
        : null;

    const firebaseUser =
      await verifyFirebaseIdToken(
        token
      );

    if (!firebaseUser) {
      return next(
        fail(
          401,
          "Unauthorized access",
          "UNAUTHORIZED"
        )
      );
    }

    const user =
      await ensureUserProfile(
        firebaseUser,
        {
          role: "PARENT",
        }
      );

    req.firebaseUser =
      firebaseUser;

    req.user =
      user;

    return next();
  } catch (error) {
    next(error);
  }
}


module.exports = {
  authenticate,
};