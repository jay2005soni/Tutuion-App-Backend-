const { randomUUID } = require("crypto");
const { hashPassword } = require("../utils/password");

const db = {
  users: [],
  parents: [],
  tutors: [],
  admins: [],
  students: [],
  attendance: [],
  homework: [],
  tests: [],
  questions: [],
  testAttempts: [],
  answers: [],
  results: [],
  progress: [],
  notes: [],
  syllabus: [],
  fees: [],
  payments: [],
  announcements: [],
  notifications: [],
};

function id(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

function seed() {
  if (db.users.length) return;

  const adminUser = {
    id: id("USR"),
    name: "Admin User",
    email: "admin@tuition.local",
    phone: "9000000000",
    role: "ADMIN",
    passwordHash: hashPassword("admin123"),
  };
  const tutorUser = {
    id: id("USR"),
    name: "Priya Tutor",
    email: "tutor@tuition.local",
    phone: "9000000001",
    role: "TUTOR",
    passwordHash: hashPassword("tutor123"),
  };
  const parentUser = {
    id: id("USR"),
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    role: "PARENT",
    passwordHash: hashPassword("parent123"),
  };

  db.users.push(adminUser, tutorUser, parentUser);

  const admin = { id: id("ADM"), userId: adminUser.id };
  const tutor = {
    id: id("TUT"),
    userId: tutorUser.id,
    classes: ["8-A", "9-A"],
  };
  const parent = { id: id("PAR"), userId: parentUser.id };
  db.admins.push(admin);
  db.tutors.push(tutor);
  db.parents.push(parent);

  const student = {
    id: id("STU"),
    name: "Aarav Sharma",
    class: "8",
    section: "A",
    rollNumber: "21",
    parentId: parent.id,
    tutorId: tutor.id,
    subjects: ["Mathematics", "Science", "English", "Hindi", "Computer"],
    status: "active",
  };
  db.students.push(student);

  db.attendance.push(
    { id: id("ATT"), studentId: student.id, date: "2026-09-01", status: "present", markedBy: tutorUser.id },
    { id: id("ATT"), studentId: student.id, date: "2026-09-02", status: "absent", markedBy: tutorUser.id },
    { id: id("ATT"), studentId: student.id, date: "2026-09-11", status: "present", markedBy: tutorUser.id }
  );
  db.homework.push({
    id: id("HW"),
    studentId: student.id,
    subject: "Mathematics",
    title: "Exercise 5.2",
    description: "Solve questions 1-10",
    assignedDate: "2026-09-11",
    dueDate: "2026-09-13",
    status: "pending",
  });
  const test = {
    id: id("TST"),
    title: "Algebra & Linear Equations",
    subject: "Mathematics",
    class: "8",
    date: "2026-09-15",
    startTime: "10:00",
    durationMinutes: 45,
    totalMarks: 30,
  };
  db.tests.push(test);
  db.questions.push({
    id: id("Q"),
    testId: test.id,
    question: "Solve x + 5 = 10",
    options: ["3", "5", "10", "15"],
    answer: "5",
    marks: 1,
  });
  db.results.push({
    id: id("RES"),
    testId: test.id,
    studentId: student.id,
    testName: "Algebra Test",
    subject: "Mathematics",
    obtainedMarks: 18,
    totalMarks: 20,
    percentage: 90,
    date: "2026-09-10",
  });
  db.progress.push(
    { id: id("PRO"), studentId: student.id, subject: "Mathematics", percentage: 78, teacherRemark: "Needs more practice in algebra" },
    { id: id("PRO"), studentId: student.id, subject: "Science", percentage: 92, teacherRemark: "Good progress" }
  );
  db.notes.push({
    id: id("NOT"),
    title: "Algebra & Linear Equations",
    subject: "Mathematics",
    class: "8",
    description: "Chapter notes",
    fileUrl: "https://example.com/algebra.pdf",
    fileName: "algebra.pdf",
    fileType: "pdf",
    isImportant: true,
  });
  db.syllabus.push({ id: id("SYL"), studentId: student.id, subject: "Mathematics", completed: 7, total: 10 });
  db.fees.push({ id: id("FEE"), studentId: student.id, amount: 4000, dueDate: "2026-09-15", description: "September Tuition Fee", status: "pending" });
  db.announcements.push({ id: id("ANN"), title: "Parent Teacher Meeting", message: "PTM will be held on Sunday.", date: "2026-09-14", priority: "high" });
}

seed();

module.exports = { db, id };
