const router = require("express").Router();

const controller = require("../controllers/attendanceController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");

// ======================================================
// GET ATTENDANCE BY DATE
// ======================================================

router.get(
  "/admin",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.listAttendance
);

// ======================================================
// MARK SINGLE ATTENDANCE
// ======================================================

router.post(
  "/",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.createAttendance
);

// ======================================================
// UPDATE ATTENDANCE
// ======================================================

router.put(
  "/:attendanceId",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.updateAttendance
);

// ======================================================
// BULK ATTENDANCE
// ======================================================

router.post(
  "/bulk",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.bulkAttendance
);

module.exports = router;