const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { percentage } = require("./dashboardController");

const allowedStatuses = ["present", "absent", "holiday", "no_class"];

function getAttendance(req, res, next) {
  try {
    const student = requireStudentAccess(req.user, req.params.studentId);
    const records = db.attendance.filter((item) => {
      if (item.studentId !== student.id) return false;
      if (req.query.month && Number(item.date.slice(5, 7)) !== Number(req.query.month)) return false;
      if (req.query.year && Number(item.date.slice(0, 4)) !== Number(req.query.year)) return false;
      return true;
    });
    return ok(res, "Attendance fetched successfully", {
      studentId: student.id,
      summary: {
        totalClasses: records.filter((item) => ["present", "absent"].includes(item.status)).length,
        present: records.filter((item) => item.status === "present").length,
        absent: records.filter((item) => item.status === "absent").length,
        percentage: percentage(records),
      },
      records,
    });
  } catch (error) {
    next(error);
  }
}

function createAttendance(req, res, next) {
  try {
    if (!allowedStatuses.includes(req.body.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
    requireStudentAccess(req.user, req.body.studentId);
    const record = { id: id("ATT"), studentId: req.body.studentId, date: req.body.date, status: req.body.status, markedBy: req.user.id };
    db.attendance.push(record);
    return created(res, "Attendance marked successfully", record);
  } catch (error) {
    next(error);
  }
}

function updateAttendance(req, res, next) {
  try {
    const record = db.attendance.find((item) => item.id === req.params.attendanceId);
    if (!record) throw fail(404, "Attendance not found", "ATTENDANCE_NOT_FOUND");
    requireStudentAccess(req.user, record.studentId);
    if (req.body.status && !allowedStatuses.includes(req.body.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
    record.date = req.body.date ?? record.date;
    record.status = req.body.status ?? record.status;
    return ok(res, "Attendance updated successfully", record);
  } catch (error) {
    next(error);
  }
}

function bulkAttendance(req, res, next) {
  try {
    const records = (req.body.records || []).map((item) => {
      if (!allowedStatuses.includes(item.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
      requireStudentAccess(req.user, item.studentId);
      return { id: id("ATT"), studentId: item.studentId, date: req.body.date, status: item.status, markedBy: req.user.id };
    });
    db.attendance.push(...records);
    return created(res, "Bulk attendance marked successfully", { records });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAttendance, createAttendance, updateAttendance, bulkAttendance };
