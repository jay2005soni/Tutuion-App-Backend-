const { db } = require("../config/database");
const { fail, ok } = require("../utils/http");
const { currentTutor } = require("../services/permissionService");

function meStudents(req, res, next) {
  try {
    const tutor = currentTutor(req.user.id);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    return ok(res, "Tutor students fetched successfully", { students: db.students.filter((item) => item.tutorId === tutor.id) });
  } catch (error) {
    next(error);
  }
}

function meClasses(req, res, next) {
  try {
    const tutor = currentTutor(req.user.id);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    return ok(res, "Tutor classes fetched successfully", { classes: tutor.classes || [] });
  } catch (error) {
    next(error);
  }
}

module.exports = { meStudents, meClasses };
