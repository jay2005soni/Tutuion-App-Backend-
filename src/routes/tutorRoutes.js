const router = require("express").Router();
const controller = require("../controllers/tutorController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.get("/me/students", authenticate, requireRoles("TUTOR"), controller.meStudents);
router.get("/me/classes", authenticate, requireRoles("TUTOR"), controller.meClasses);

module.exports = router;
