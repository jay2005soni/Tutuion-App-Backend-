const { db, id } = require("../config/database");
const { ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function getProgress(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    const subjects = db.progress.filter((item) => item.studentId === req.params.studentId);
    const overallPercentage = subjects.length ? Math.round(subjects.reduce((sum, item) => sum + item.percentage, 0) / subjects.length) : 0;
    return ok(res, "Progress fetched successfully", { overallPercentage, subjects });
  } catch (error) {
    next(error);
  }
}

function updateProgress(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    let progress = db.progress.find((item) => item.studentId === req.params.studentId && item.subject === req.body.subject);
    if (!progress) {
      progress = { id: id("PRO"), studentId: req.params.studentId, subject: req.body.subject, percentage: 0, teacherRemark: "" };
      db.progress.push(progress);
    }
    progress.percentage = req.body.percentage ?? progress.percentage;
    progress.teacherRemark = req.body.teacherRemark ?? progress.teacherRemark;
    return ok(res, "Progress updated successfully", progress);
  } catch (error) {
    next(error);
  }
}

function weakSubjects(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    const subjects = db.progress
      .filter((item) => item.studentId === req.params.studentId && item.percentage < 70)
      .map((item) => ({ subject: item.subject, score: item.percentage, reason: "Low test performance" }));
    return ok(res, "Weak subjects fetched successfully", { subjects });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProgress, updateProgress, weakSubjects };
