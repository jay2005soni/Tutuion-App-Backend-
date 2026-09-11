const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function createStudent(req, res, next) {
  try {
    const { name, parentId } = req.body;
    if (!name || !parentId) throw fail(422, "name and parentId are required", "VALIDATION_ERROR");
    if (!db.parents.some((parent) => parent.id === parentId)) throw fail(404, "Parent not found", "PARENT_NOT_FOUND");
    const student = {
      id: id("STU"),
      name,
      class: req.body.class || null,
      section: req.body.section || null,
      rollNumber: req.body.rollNumber || null,
      parentId,
      tutorId: req.body.tutorId || null,
      subjects: req.body.subjects || [],
      status: req.body.status || "active",
    };
    db.students.push(student);
    return created(res, "Student created successfully", student);
  } catch (error) {
    next(error);
  }
}

function getStudent(req, res, next) {
  try {
    return ok(res, "Student fetched successfully", requireStudentAccess(req.user, req.params.studentId));
  } catch (error) {
    next(error);
  }
}

function updateStudent(req, res, next) {
  try {
    const student = requireStudentAccess(req.user, req.params.studentId);
    Object.assign(student, {
      name: req.body.name ?? student.name,
      class: req.body.class ?? student.class,
      section: req.body.section ?? student.section,
      rollNumber: req.body.rollNumber ?? student.rollNumber,
      parentId: req.body.parentId ?? student.parentId,
      tutorId: req.body.tutorId ?? student.tutorId,
      subjects: req.body.subjects ?? student.subjects,
      status: req.body.status ?? student.status,
    });
    return ok(res, "Student updated successfully", student);
  } catch (error) {
    next(error);
  }
}

function updateStatus(req, res, next) {
  try {
    const student = requireStudentAccess(req.user, req.params.studentId);
    if (!["active", "inactive", "pending_assignment"].includes(req.body.status)) {
      throw fail(422, "Invalid student status", "VALIDATION_ERROR");
    }
    student.status = req.body.status;
    return ok(res, "Student status updated successfully", student);
  } catch (error) {
    next(error);
  }
}

module.exports = { createStudent, getStudent, updateStudent, updateStatus };
