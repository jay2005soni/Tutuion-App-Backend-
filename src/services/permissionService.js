const { db } = require("../config/database");
const { fail } = require("../utils/http");

function currentParent(userId) {
  return db.parents.find((parent) => parent.userId === userId);
}

function currentTutor(userId) {
  return db.tutors.find((tutor) => tutor.userId === userId);
}

function canAccessStudent(user, student) {
  if (!student) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "PARENT") return currentParent(user.id)?.id === student.parentId;
  if (user.role === "TUTOR") return currentTutor(user.id)?.id === student.tutorId;
  return false;
}

function requireStudentAccess(user, studentId) {
  const student = db.students.find((item) => item.id === studentId);
  if (!student) throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
  if (!canAccessStudent(user, student)) throw fail(403, "Forbidden", "FORBIDDEN");
  return student;
}

module.exports = { currentParent, currentTutor, canAccessStudent, requireStudentAccess };
