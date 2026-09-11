const { db } = require("../config/database");
const { ok } = require("../utils/http");
const { currentParent, requireStudentAccess } = require("../services/permissionService");

function percentage(values) {
  const counted = values.filter((item) => ["present", "absent"].includes(item.status));
  if (!counted.length) return 0;
  return Number(((counted.filter((item) => item.status === "present").length / counted.length) * 100).toFixed(2));
}

function parentDashboard(req, res, next) {
  try {
    const parent = currentParent(req.user.id);
    const student = req.query.studentId
      ? requireStudentAccess(req.user, req.query.studentId)
      : db.students.find((item) => item.parentId === parent?.id);

    if (!student) return ok(res, "Dashboard fetched successfully", { student: null, overview: {} });

    const attendance = db.attendance.filter((item) => item.studentId === student.id);
    const homework = db.homework.filter((item) => item.studentId === student.id);
    const results = db.results.filter((item) => item.studentId === student.id);
    const progress = db.progress.filter((item) => item.studentId === student.id);
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
      latestAnnouncement: db.announcements.at(-1) || null,
      upcomingTest: db.tests.find((item) => item.class === student.class && item.date >= new Date().toISOString().slice(0, 10)) || null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { parentDashboard, percentage };
