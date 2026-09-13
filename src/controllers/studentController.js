const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function createStudent(req, res, next) {
  try {
    const { name, parentId } = req.body;
    if (!name || !parentId) throw fail(422, "name and parentId are required", "VALIDATION_ERROR");
    if (!(await store.getDoc("parents", parentId))) throw fail(404, "Parent not found", "PARENT_NOT_FOUND");
    const student = await store.createDoc("students", {
      name,
      class: req.body.class || null,
      section: req.body.section || null,
      rollNumber: req.body.rollNumber || null,
      parentId,
      tutorId: req.body.tutorId || null,
      subjects: req.body.subjects || [],
      status: req.body.status || "active",
    }, store.makeId("STU"));
    return created(res, "Student created successfully", student);
  } catch (error) {
    next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    return ok(res, "Student fetched successfully", await requireStudentAccess(req.user, req.params.studentId));
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await requireStudentAccess(req.user, req.params.studentId);
    const updated = await store.updateDoc("students", student.id, {
      name: req.body.name ?? student.name,
      class: req.body.class ?? student.class,
      section: req.body.section ?? student.section,
      rollNumber: req.body.rollNumber ?? student.rollNumber,
      parentId: req.body.parentId ?? student.parentId,
      tutorId: req.body.tutorId ?? student.tutorId,
      subjects: req.body.subjects ?? student.subjects,
      status: req.body.status ?? student.status,
    });
    return ok(res, "Student updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const student = await requireStudentAccess(req.user, req.params.studentId);
    if (!["active", "inactive", "pending_assignment"].includes(req.body.status)) {
      throw fail(422, "Invalid student status", "VALIDATION_ERROR");
    }
    const updated = await store.updateDoc("students", student.id, { status: req.body.status });
    return ok(res, "Student status updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

module.exports = { createStudent, getStudent, updateStudent, updateStatus };
