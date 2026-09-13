const { ok } = require("../utils/http");
const { currentParent, requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

function percentage(values) {
  const counted = values.filter((item) => ["present", "absent"].includes(item.status));
  if (!counted.length) return 0;
  return Number(((counted.filter((item) => item.status === "present").length / counted.length) * 100).toFixed(2));
}

async function parentDashboard(req, res, next) {
  try {
    const parent = await currentParent(req.user.id);
    const student = req.query.studentId
      ? await requireStudentAccess(req.user, req.query.studentId)
      : (await store.listDocs("students", [["parentId", "==", parent?.id]])).at(0);

    if (!student) return ok(res, "Dashboard fetched successfully", { student: null, overview: {} });

    const attendance = await store.listDocs("attendance", [["studentId", "==", student.id]]);
    const homework = await store.listDocs("homework", [["studentId", "==", student.id]]);
    const results = await store.listDocs("results", [["studentId", "==", student.id]]);
    const progress = await store.listDocs("progress", [["studentId", "==", student.id]]);
    const announcements = await store.listDocs("announcements");
    const tests = await store.listDocs("tests", [["class", "==", student.class]]);
    const latestResult = results.at(-1);

    return ok(res, "Dashboard fetched successfully", {
      student: { id: student.id, name: student.name, class: student.class, section: student.section },
      overview: {
        attendancePercentage: percentage(attendance),
        progressPercentage: progress.length ? Math.round(progress.reduce((sum, item) => sum + item.percentage, 0) / progress.length) : 0,
        pendingHomework: homework.filter((item) => item.status === "pending").length,
        latestTestScore: latestResult ? { obtained: latestResult.obtainedMarks, total: latestResult.totalMarks } : null,
      },
      todayAttendance: attendance.find((item) => item.date === new Date().toISOString().slice(0, 10)) || null,
      homework,
      latestAnnouncement: announcements.at(-1) || null,
      upcomingTest: tests.find((item) => item.date >= new Date().toISOString().slice(0, 10)) || null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { parentDashboard, percentage };
