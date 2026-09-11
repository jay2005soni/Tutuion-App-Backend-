const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { hashPassword } = require("../utils/password");

function dashboard(req, res) {
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = db.attendance.filter((item) => item.date === today);
  const pendingFees = db.fees.filter((item) => item.status !== "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return ok(res, "Admin dashboard fetched successfully", {
    totalStudents: db.students.length,
    totalTutors: db.tutors.length,
    todayPresent: todayRecords.filter((item) => item.status === "present").length,
    todayAbsent: todayRecords.filter((item) => item.status === "absent").length,
    pendingFees,
  });
}

function listStudents(req, res) {
  return ok(res, "Students fetched successfully", { students: db.students });
}

function deactivateStudent(req, res, next) {
  try {
    const student = db.students.find((item) => item.id === req.params.studentId);
    if (!student) throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
    student.status = "inactive";
    return ok(res, "Student deactivated successfully", student);
  } catch (error) {
    next(error);
  }
}

function listParents(req, res) {
  return ok(res, "Parents fetched successfully", { parents: db.parents.map((parent) => ({ ...parent, user: db.users.find((user) => user.id === parent.userId) })) });
}

function updateParent(req, res, next) {
  try {
    const parent = db.parents.find((item) => item.id === req.params.parentId);
    if (!parent) throw fail(404, "Parent not found", "PARENT_NOT_FOUND");
    const user = db.users.find((item) => item.id === parent.userId);
    Object.assign(user, req.body);
    return ok(res, "Parent updated successfully", { ...parent, user });
  } catch (error) {
    next(error);
  }
}

function listTutors(req, res) {
  return ok(res, "Tutors fetched successfully", { tutors: db.tutors.map((tutor) => ({ ...tutor, user: db.users.find((user) => user.id === tutor.userId) })) });
}

function createTutor(req, res) {
  const user = {
    id: id("USR"),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: "TUTOR",
    passwordHash: hashPassword(req.body.password || "tutor123"),
  };
  const tutor = { id: id("TUT"), userId: user.id, classes: req.body.classes || [] };
  db.users.push(user);
  db.tutors.push(tutor);
  return created(res, "Tutor created successfully", { tutor, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}

function updateTutor(req, res, next) {
  try {
    const tutor = db.tutors.find((item) => item.id === req.params.tutorId);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    const user = db.users.find((item) => item.id === tutor.userId);
    Object.assign(user, req.body);
    tutor.classes = req.body.classes ?? tutor.classes;
    return ok(res, "Tutor updated successfully", { tutor, user });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard, listStudents, deactivateStudent, listParents, updateParent, listTutors, createTutor, updateTutor };
