const router = require("express").Router();
const studentController = require("../controllers/studentController");
const attendanceController = require("../controllers/attendanceController");
const homeworkController = require("../controllers/homeworkController");
const testController = require("../controllers/testController");
const resultController = require("../controllers/resultController");
const progressController = require("../controllers/progressController");
const notesController = require("../controllers/notesController");
const syllabusController = require("../controllers/syllabusController");
const feesController = require("../controllers/feesController");
const paymentController = require("../controllers/paymentController");
const announcementController = require("../controllers/announcementController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), studentController.createStudent);
router.get("/:studentId", authenticate, studentController.getStudent);
router.put("/:studentId", authenticate, requireRoles("TUTOR", "ADMIN"), studentController.updateStudent);
router.patch("/:studentId/status", authenticate, requireRoles("TUTOR", "ADMIN"), studentController.updateStatus);

router.get("/:studentId/attendance", authenticate, attendanceController.getAttendance);
router.get("/:studentId/homework", authenticate, homeworkController.getStudentHomework);
router.get("/:studentId/tests/upcoming", authenticate, testController.upcomingTests);
router.get("/:studentId/results", authenticate, resultController.studentResults);
router.get("/:studentId/progress", authenticate, progressController.getProgress);
router.put("/:studentId/progress", authenticate, requireRoles("TUTOR", "ADMIN"), progressController.updateProgress);
router.get("/:studentId/weak-subjects", authenticate, progressController.weakSubjects);
router.get("/:studentId/notes", authenticate, notesController.getStudentNotes);
router.get("/:studentId/syllabus", authenticate, syllabusController.getSyllabus);
router.get("/:studentId/fees", authenticate, feesController.feeSummary);
router.get("/:studentId/payments", authenticate, paymentController.paymentHistory);
router.get("/:studentId/announcements", authenticate, announcementController.getStudentAnnouncements);

module.exports = router;
