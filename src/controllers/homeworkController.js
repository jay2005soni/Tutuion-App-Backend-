const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { createNotification } = require("../services/notificationService");

const statuses = ["pending", "completed", "overdue"];

function createHomework(req, res, next) {
  try {
    requireStudentAccess(req.user, req.body.studentId);
    const homework = {
      id: id("HW"),
      studentId: req.body.studentId,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description || "",
      assignedDate: req.body.assignedDate,
      dueDate: req.body.dueDate,
      status: req.body.status || "pending",
    };
    db.homework.push(homework);
    const student = db.students.find((item) => item.id === homework.studentId);
    const parent = db.parents.find((item) => item.id === student.parentId);
    if (parent) createNotification(parent.userId, "New Homework Added", `${homework.subject}: ${homework.title}`);
    return created(res, "Homework created successfully", homework);
  } catch (error) {
    next(error);
  }
}

function getStudentHomework(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    const homework = db.homework.filter((item) => item.studentId === req.params.studentId && (!req.query.status || item.status === req.query.status));
    return ok(res, "Homework fetched successfully", { homework });
  } catch (error) {
    next(error);
  }
}

function updateHomework(req, res, next) {
  try {
    const homework = db.homework.find((item) => item.id === req.params.homeworkId);
    if (!homework) throw fail(404, "Homework not found", "HOMEWORK_NOT_FOUND");
    requireStudentAccess(req.user, homework.studentId);
    Object.assign(homework, {
      subject: req.body.subject ?? homework.subject,
      title: req.body.title ?? homework.title,
      description: req.body.description ?? homework.description,
      assignedDate: req.body.assignedDate ?? homework.assignedDate,
      dueDate: req.body.dueDate ?? homework.dueDate,
      status: req.body.status ?? homework.status,
    });
    return ok(res, "Homework updated successfully", homework);
  } catch (error) {
    next(error);
  }
}

function updateHomeworkStatus(req, res, next) {
  try {
    if (!statuses.includes(req.body.status)) throw fail(422, "Invalid homework status", "VALIDATION_ERROR");
    return updateHomework(req, res, next);
  } catch (error) {
    next(error);
  }
}

function deleteHomework(req, res, next) {
  try {
    const index = db.homework.findIndex((item) => item.id === req.params.homeworkId);
    if (index === -1) throw fail(404, "Homework not found", "HOMEWORK_NOT_FOUND");
    requireStudentAccess(req.user, db.homework[index].studentId);
    const [homework] = db.homework.splice(index, 1);
    return ok(res, "Homework deleted successfully", homework);
  } catch (error) {
    next(error);
  }
}

module.exports = { createHomework, getStudentHomework, updateHomework, updateHomeworkStatus, deleteHomework };
