const { db } = require("../config/database");
const { ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function getSyllabus(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    const subjects = db.syllabus
      .filter((item) => item.studentId === req.params.studentId)
      .map((item) => ({ ...item, percentage: item.total ? Math.round((item.completed / item.total) * 100) : 0 }));
    return ok(res, "Syllabus fetched successfully", { subjects });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSyllabus };
