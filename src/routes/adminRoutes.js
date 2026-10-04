const router = require("express").Router();

const admin = require("../controllers/adminController");
const student = require("../controllers/studentController");
const parent = require("../controllers/parentController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.use(authenticate, requireRoles("ADMIN"));

router.get("/dashboard", admin.dashboard);

router.get("/students", admin.listStudents);
router.post("/students", student.createStudent);
router.put("/students/:studentId", student.updateStudent);
router.delete("/students/:studentId", admin.deactivateStudent);

// Student approval
router.patch(
  "/students/:studentId/status",
  student.updateStatus
);

router.get("/parents", admin.listParents);
router.put("/parents/:parentId", admin.updateParent);

// Parent approval
router.patch(
  "/parents/:parentId/status",
  parent.updateParentStatus
);

router.get("/tutors", admin.listTutors);
router.post("/tutors", admin.createTutor);
router.put("/tutors/:tutorId", admin.updateTutor);

module.exports = router;