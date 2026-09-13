const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function studentResults(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Results fetched successfully", { results: await store.listDocs("results", [["studentId", "==", req.params.studentId]]) });
  } catch (error) {
    next(error);
  }
}

async function resultDetail(req, res, next) {
  try {
    const result = await store.getDoc("results", req.params.resultId);
    if (!result) throw fail(404, "Result not found", "RESULT_NOT_FOUND");
    await requireStudentAccess(req.user, result.studentId);
    return ok(res, "Result fetched successfully", result);
  } catch (error) {
    next(error);
  }
}

async function createResult(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.body.studentId);
    const result = await store.createDoc("results", req.body, store.makeId("RES"));
    return created(res, "Result created successfully", result);
  } catch (error) {
    next(error);
  }
}

async function updateResult(req, res, next) {
  try {
    const result = await store.getDoc("results", req.params.resultId);
    if (!result) throw fail(404, "Result not found", "RESULT_NOT_FOUND");
    await requireStudentAccess(req.user, result.studentId);
    return ok(res, "Result updated successfully", await store.updateDoc("results", result.id, req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = { studentResults, resultDetail, createResult, updateResult };
