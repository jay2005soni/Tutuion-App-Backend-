const router = require("express").Router();
const controller = require("../controllers/attendanceController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createAttendance);
router.put("/:attendanceId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.updateAttendance);
router.post("/bulk", authenticate, requireRoles("TUTOR", "ADMIN"), controller.bulkAttendance);

module.exports = router;
