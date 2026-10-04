const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { percentage } = require("./dashboardController");
const store = require("../services/firestoreService");

const allowedStatuses = ["present", "absent", "holiday", "no_class"];

async function getAttendance(req, res, next) {
  try {
    const student = await requireStudentAccess(req.user, req.params.studentId);
    const allRecords = await store.listDocs("attendance", [["studentId", "==", student.id]]);
    const records = allRecords.filter((item) => {
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

async function createAttendance(req, res, next) {
  try {
    if (!allowedStatuses.includes(req.body.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
    await requireStudentAccess(req.user, req.body.studentId);
    const record = await store.createDoc("attendance", {
      studentId: req.body.studentId,
      date: req.body.date,
      status: req.body.status,
      markedBy: req.user.id,
    }, store.makeId("ATT"));
    return created(res, "Attendance marked successfully", record);
  } catch (error) {
    next(error);
  }
}

async function updateAttendance(req, res, next) {
  try {
    const record = await store.getDoc("attendance", req.params.attendanceId);
    if (!record) throw fail(404, "Attendance not found", "ATTENDANCE_NOT_FOUND");
    await requireStudentAccess(req.user, record.studentId);
    if (req.body.status && !allowedStatuses.includes(req.body.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
    const updated = await store.updateDoc("attendance", record.id, {
      date: req.body.date ?? record.date,
      status: req.body.status ?? record.status,
    });
    return ok(res, "Attendance updated successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function listAttendance(req, res, next) {
  try {
    const filters = [];

    if (req.query.date) {
      filters.push(["date", "==", req.query.date]);
    }

    const records = await store.listDocs("attendance", filters);

    return ok(
      res,
      "Attendance records fetched successfully",
      {
        records,
      }
    );
  } catch (error) {
    next(error);
  }
}

async function bulkAttendance(req, res, next) {
  try {
    const records = [];
    for (const item of req.body.records || []) {
      if (!allowedStatuses.includes(item.status)) throw fail(422, "Invalid attendance status", "VALIDATION_ERROR");
      await requireStudentAccess(req.user, item.studentId);
      records.push(await store.createDoc("attendance", {
        studentId: item.studentId,
        date: req.body.date,
        status: item.status,
        markedBy: req.user.id,
      }, store.makeId("ATT")));
    }
    return created(res, "Bulk attendance marked successfully", { records });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAttendance, createAttendance, updateAttendance, bulkAttendance };
