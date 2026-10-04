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
// ADMIN + TUTOR
// ======================================================

router.get(
  "/admin",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.listAttendance
);

// ======================================================
// MARK SINGLE ATTENDANCE
// ADMIN + TUTOR
// ======================================================

router.post(
  "/",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.createAttendance
);

// ======================================================
// UPDATE ATTENDANCE
// ADMIN + TUTOR
// ======================================================

router.put(
  "/:attendanceId",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.updateAttendance
);

// ======================================================
// BULK ATTENDANCE
// ADMIN + TUTOR
// ======================================================

router.post(
  "/bulk",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.bulkAttendance
);

module.exports = router;