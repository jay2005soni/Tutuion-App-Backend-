const { ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function getProgress(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    const subjects = await store.listDocs("progress", [["studentId", "==", req.params.studentId]]);
    const overallPercentage = subjects.length ? Math.round(subjects.reduce((sum, item) => sum + item.percentage, 0) / subjects.length) : 0;
    return ok(res, "Progress fetched successfully", { overallPercentage, subjects });
  } catch (error) {
    next(error);
  }
}

async function updateProgress(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    let progress = await store.findOne("progress", [["studentId", "==", req.params.studentId], ["subject", "==", req.body.subject]]);
    if (!progress) {
      progress = await store.createDoc("progress", { studentId: req.params.studentId, subject: req.body.subject, percentage: 0, teacherRemark: "" }, store.makeId("PRO"));
    }
    const updated = await store.updateDoc("progress", progress.id, {
      percentage: req.body.percentage ?? progress.percentage,
      teacherRemark: req.body.teacherRemark ?? progress.teacherRemark,
    });
    return ok(res, "Progress updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function weakSubjects(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    const subjects = (await store.listDocs("progress", [["studentId", "==", req.params.studentId]]))
      .filter((item) => item.percentage < 70)
      .map((item) => ({ subject: item.subject, score: item.percentage, reason: "Low test performance" }));
    return ok(res, "Weak subjects fetched successfully", { subjects });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProgress, updateProgress, weakSubjects };
