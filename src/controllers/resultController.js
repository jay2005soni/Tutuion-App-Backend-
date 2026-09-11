const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function studentResults(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Results fetched successfully", { results: db.results.filter((item) => item.studentId === req.params.studentId) });
  } catch (error) {
    next(error);
  }
}

function resultDetail(req, res, next) {
  try {
    const result = db.results.find((item) => item.id === req.params.resultId);
    if (!result) throw fail(404, "Result not found", "RESULT_NOT_FOUND");
    requireStudentAccess(req.user, result.studentId);
    return ok(res, "Result fetched successfully", result);
  } catch (error) {
    next(error);
  }
}

function createResult(req, res, next) {
  try {
    requireStudentAccess(req.user, req.body.studentId);
    const result = { id: id("RES"), ...req.body };
    db.results.push(result);
    return created(res, "Result created successfully", result);
  } catch (error) {
    next(error);
  }
}

function updateResult(req, res, next) {
  try {
    const result = db.results.find((item) => item.id === req.params.resultId);
    if (!result) throw fail(404, "Result not found", "RESULT_NOT_FOUND");
    requireStudentAccess(req.user, result.studentId);
    Object.assign(result, req.body);
    return ok(res, "Result updated successfully", result);
  } catch (error) {
    next(error);
  }
}

module.exports = { studentResults, resultDetail, createResult, updateResult };
