const { ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function getSyllabus(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    const subjects = (await store.listDocs("syllabus", [["studentId", "==", req.params.studentId]]))
      .map((item) => ({ ...item, percentage: item.total ? Math.round((item.completed / item.total) * 100) : 0 }));
    return ok(res, "Syllabus fetched successfully", { subjects });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSyllabus };
