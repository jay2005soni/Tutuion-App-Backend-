const { fail } = require("../utils/http");
const store = require("./firestoreService");

async function currentParent(userId) {
  return store.findOne("parents", [["userId", "==", userId]]);
}

async function currentTutor(userId) {
  return store.findOne("tutors", [["userId", "==", userId]]);
}

async function canAccessStudent(user, student) {
  if (!student) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "PARENT") return (await currentParent(user.id))?.id === student.parentId;
  if (user.role === "TUTOR") return (await currentTutor(user.id))?.id === student.tutorId;
  return false;
}

async function requireStudentAccess(user, studentId) {
  const student = await store.getDoc("students", studentId);
  if (!student) throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
  if (!(await canAccessStudent(user, student))) throw fail(403, "Forbidden", "FORBIDDEN");
  return student;
}

module.exports = { currentParent, currentTutor, canAccessStudent, requireStudentAccess };
