const { created, fail, ok } = require("../utils/http");
const { getAuth } = require("../config/firebase");
const store = require("../services/firestoreService");

async function dashboard(req, res, next) {
  try {
  const today = new Date().toISOString().slice(0, 10);
  const students = await store.listDocs("students");
  const tutors = await store.listDocs("tutors");
  const todayRecords = await store.listDocs("attendance", [["date", "==", today]]);
  const fees = await store.listDocs("fees");
  const pendingFees = fees.filter((item) => item.status !== "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return ok(res, "Admin dashboard fetched successfully", {
    totalStudents: students.length,
    totalTutors: tutors.length,
    todayPresent: todayRecords.filter((item) => item.status === "present").length,
    todayAbsent: todayRecords.filter((item) => item.status === "absent").length,
    pendingFees,
  });
  } catch (error) {
    next(error);
  }
}

async function listStudents(req, res, next) {
  try {
    return ok(res, "Students fetched successfully", { students: await store.listDocs("students") });
  } catch (error) {
    next(error);
  }
}

async function deactivateStudent(req, res, next) {
  try {
    const student = await store.getDoc("students", req.params.studentId);
    if (!student) throw fail(404, "Student not found", "STUDENT_NOT_FOUND");
    return ok(res, "Student deactivated successfully", await store.updateDoc("students", student.id, { status: "inactive" }));
  } catch (error) {
    next(error);
  }
}

async function listParents(req, res, next) {
  try {
    const parents = await store.listDocs("parents");
    const data = await Promise.all(parents.map(async (parent) => ({ ...parent, user: await store.getDoc("users", parent.userId) })));
    return ok(res, "Parents fetched successfully", { parents: data });
  } catch (error) {
    next(error);
  }
}

async function updateParent(req, res, next) {
  try {
    const parent = await store.getDoc("parents", req.params.parentId);
    if (!parent) throw fail(404, "Parent not found", "PARENT_NOT_FOUND");
    const user = await store.updateDoc("users", parent.userId, req.body);
    return ok(res, "Parent updated successfully", { ...parent, user });
  } catch (error) {
    next(error);
  }
}

async function listTutors(req, res, next) {
  try {
    const tutors = await store.listDocs("tutors");
    const data = await Promise.all(tutors.map(async (tutor) => ({ ...tutor, user: await store.getDoc("users", tutor.userId) })));
    return ok(res, "Tutors fetched successfully", { tutors: data });
  } catch (error) {
    next(error);
  }
}

async function createTutor(req, res, next) {
  try {
    const firebaseUser = await getAuth().createUser({
      email: req.body.email,
      password: req.body.password || "tutor123",
      displayName: req.body.name,
      phoneNumber: req.body.phone?.startsWith("+") ? req.body.phone : undefined,
    });
    const user = await store.createDoc("users", {
      firebaseUid: firebaseUser.uid,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: "TUTOR",
    }, store.makeId("USR"));
    const tutor = await store.createDoc("tutors", { userId: user.id, firebaseUid: firebaseUser.uid, classes: req.body.classes || [] }, store.makeId("TUT"));
    return created(res, "Tutor created successfully", { tutor, user });
  } catch (error) {
    next(error);
  }
}

async function updateTutor(req, res, next) {
  try {
    const tutor = await store.getDoc("tutors", req.params.tutorId);
    if (!tutor) throw fail(404, "Tutor not found", "TUTOR_NOT_FOUND");
    const user = await store.updateDoc("users", tutor.userId, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: "TUTOR",
    });
    const updatedTutor = await store.updateDoc("tutors", tutor.id, { classes: req.body.classes ?? tutor.classes });
    return ok(res, "Tutor updated successfully", { tutor: updatedTutor, user });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard, listStudents, deactivateStudent, listParents, updateParent, listTutors, createTutor, updateTutor };
