const {
  fail,
} = require("../utils/http");

function requireRoles(
  ...roles
) {
  return (
    req,
    res,
    next
  ) => {
    if (
      !req.user ||
      !roles.includes(
        req.user.role
      )
    ) {
      return next(
        fail(
          403,
          "Forbidden",
          "FORBIDDEN"
        )
      );
    }

    next();
  };
}

module.exports = {
  requireRoles,
};