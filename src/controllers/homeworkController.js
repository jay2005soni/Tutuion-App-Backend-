const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { createNotification } = require("../services/notificationService");
const store = require("../services/firestoreService");

const statuses = ["pending", "completed", "overdue"];

async function createHomework(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.body.studentId);
    const homework = await store.createDoc("homework", {
      studentId: req.body.studentId,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description || "",
      assignedDate: req.body.assignedDate,
      dueDate: req.body.dueDate,
      status: req.body.status || "pending",
    }, store.makeId("HW"));
    const student = await store.getDoc("students", homework.studentId);
    const parent = student ? await store.getDoc("parents", student.parentId) : null;
    if (parent) await createNotification(parent.userId, "New Homework Added", `${homework.subject}: ${homework.title}`);
    return created(res, "Homework created successfully", homework);
  } catch (error) {
    next(error);
  }
}

async function getStudentHomework(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    const filters = [["studentId", "==", req.params.studentId]];
    if (req.query.status) filters.push(["status", "==", req.query.status]);
    const homework = await store.listDocs("homework", filters);
    return ok(res, "Homework fetched successfully", { homework });
  } catch (error) {
    next(error);
  }
}

async function updateHomework(req, res, next) {
  try {
    const homework = await store.getDoc("homework", req.params.homeworkId);
    if (!homework) throw fail(404, "Homework not found", "HOMEWORK_NOT_FOUND");
    await requireStudentAccess(req.user, homework.studentId);
    const updated = await store.updateDoc("homework", homework.id, {
      subject: req.body.subject ?? homework.subject,
      title: req.body.title ?? homework.title,
      description: req.body.description ?? homework.description,
      assignedDate: req.body.assignedDate ?? homework.assignedDate,
      dueDate: req.body.dueDate ?? homework.dueDate,
      status: req.body.status ?? homework.status,
    });
    return ok(res, "Homework updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function updateHomeworkStatus(req, res, next) {
  try {
    if (!statuses.includes(req.body.status)) throw fail(422, "Invalid homework status", "VALIDATION_ERROR");
    return updateHomework(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function deleteHomework(req, res, next) {
  try {
    const homework = await store.getDoc("homework", req.params.homeworkId);
    if (!homework) throw fail(404, "Homework not found", "HOMEWORK_NOT_FOUND");
    await requireStudentAccess(req.user, homework.studentId);
    await store.deleteDoc("homework", homework.id);
    return ok(res, "Homework deleted successfully", homework);
  } catch (error) {
    next(error);
  }
}

module.exports = { createHomework, getStudentHomework, updateHomework, updateHomeworkStatus, deleteHomework };
