const { fail, ok } = require("../utils/http");
const { currentTutor } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function meStudents(req, res, next) {
  try {
    const tutor = await currentTutor(req.user.id);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    return ok(res, "Tutor students fetched successfully", { students: await store.listDocs("students", [["tutorId", "==", tutor.id]]) });
  } catch (error) {
    next(error);
  }
}

async function meClasses(req, res, next) {
  try {
    const tutor = await currentTutor(req.user.id);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    return ok(res, "Tutor classes fetched successfully", { classes: tutor.classes || [] });
  } catch (error) {
    next(error);
  }
}

module.exports = { meStudents, meClasses };
