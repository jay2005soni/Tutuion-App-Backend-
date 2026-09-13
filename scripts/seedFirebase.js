require("dotenv").config();

const { getAuth } = require("../src/config/firebase");
const store = require("../src/services/firestoreService");

async function getOrCreateUser({ email, password, displayName, phone, role }) {
  let firebaseUser;
  try {
    firebaseUser = await getAuth().getUserByEmail(email);
  } catch (error) {
    firebaseUser = await getAuth().createUser({
      email,
      password,
      displayName,
      phoneNumber: phone?.startsWith("+") ? phone : undefined,
    });
  }

  let user = await store.findOne("users", [["firebaseUid", "==", firebaseUser.uid]]);
  if (!user) {
    user = await store.createDoc("users", {
      firebaseUid: firebaseUser.uid,
      name: displayName,
      email,
      phone,
      role,
    }, `USR_${role.toLowerCase()}_demo`);
  }

  return { firebaseUser, user };
}

async function upsert(collection, id, data) {
  const existing = await store.getDoc(collection, id);
  return existing ? store.updateDoc(collection, id, data) : store.createDoc(collection, data, id);
}

async function seed() {
  const adminAccount = await getOrCreateUser({
    email: "admin@tuition.local",
    password: "admin123",
    displayName: "Admin User",
    phone: "9000000000",
    role: "ADMIN",
  });

  const tutorAccount = await getOrCreateUser({
    email: "tutor@tuition.local",
    password: "tutor123",
    displayName: "Priya Tutor",
    phone: "9000000001",
    role: "TUTOR",
  });

  const parentAccount = await getOrCreateUser({
    email: "rahul@gmail.com",
    password: "parent123",
    displayName: "Rahul Sharma",
    phone: "9876543210",
    role: "PARENT",
  });

  await upsert("admins", "ADM_demo", { userId: adminAccount.user.id, firebaseUid: adminAccount.firebaseUser.uid });
  const tutor = await upsert("tutors", "TUT_demo", { userId: tutorAccount.user.id, firebaseUid: tutorAccount.firebaseUser.uid, classes: ["8-A", "9-A"] });
  const parent = await upsert("parents", "PAR_demo", { userId: parentAccount.user.id, firebaseUid: parentAccount.firebaseUser.uid });

  const student = await upsert("students", "STU_demo", {
    name: "Aarav Sharma",
    class: "8",
    section: "A",
    rollNumber: "21",
    parentId: parent.id,
    tutorId: tutor.id,
    subjects: ["Mathematics", "Science", "English", "Hindi", "Computer"],
    status: "active",
  });

  await upsert("attendance", "ATT_2026_09_01_demo", { studentId: student.id, date: "2026-09-01", status: "present", markedBy: tutorAccount.user.id });
  await upsert("attendance", "ATT_2026_09_02_demo", { studentId: student.id, date: "2026-09-02", status: "absent", markedBy: tutorAccount.user.id });
  await upsert("attendance", "ATT_2026_09_11_demo", { studentId: student.id, date: "2026-09-11", status: "present", markedBy: tutorAccount.user.id });

  await upsert("homework", "HW_demo", {
    studentId: student.id,
    subject: "Mathematics",
    title: "Exercise 5.2",
    description: "Solve questions 1-10",
    assignedDate: "2026-09-11",
    dueDate: "2026-09-13",
    status: "pending",
  });

  const test = await upsert("tests", "TST_demo", {
    title: "Algebra & Linear Equations",
    subject: "Mathematics",
    class: "8",
    date: "2026-09-15",
    startTime: "10:00",
    durationMinutes: 45,
    totalMarks: 30,
  });

  await upsert("questions", "Q_demo", {
    testId: test.id,
    question: "Solve x + 5 = 10",
    options: ["3", "5", "10", "15"],
    answer: "5",
    marks: 1,
  });

  await upsert("results", "RES_demo", {
    testId: test.id,
    studentId: student.id,
    testName: "Algebra Test",
    subject: "Mathematics",
    obtainedMarks: 18,
    totalMarks: 20,
    percentage: 90,
    date: "2026-09-10",
  });

  await upsert("progress", "PRO_math_demo", { studentId: student.id, subject: "Mathematics", percentage: 78, teacherRemark: "Needs more practice in algebra" });
  await upsert("progress", "PRO_science_demo", { studentId: student.id, subject: "Science", percentage: 92, teacherRemark: "Good progress" });
  await upsert("notes", "NOTE_demo", {
    title: "Algebra & Linear Equations",
    subject: "Mathematics",
    class: "8",
    description: "Chapter notes",
    fileUrl: "https://example.com/algebra.pdf",
    fileName: "algebra.pdf",
    fileType: "pdf",
    isImportant: true,
  });
  await upsert("syllabus", "SYL_demo", { studentId: student.id, subject: "Mathematics", completed: 7, total: 10 });
  await upsert("fees", "FEE_demo", { studentId: student.id, amount: 4000, dueDate: "2026-09-15", description: "September Tuition Fee", status: "pending" });
  await upsert("announcements", "ANN_demo", { title: "Parent Teacher Meeting", message: "PTM will be held on Sunday.", date: "2026-09-14", priority: "high" });

  console.log("Firebase seed completed.");
  console.log("Parent: rahul@gmail.com / parent123");
  console.log("Tutor: tutor@tuition.local / tutor123");
  console.log("Admin: admin@tuition.local / admin123");
  console.log(`Student ID: ${student.id}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
