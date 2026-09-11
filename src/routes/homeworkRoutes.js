const router = require("express").Router();
const controller = require("../controllers/homeworkController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createHomework);
router.patch("/:homeworkId/status", authenticate, controller.updateHomeworkStatus);
router.put("/:homeworkId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.updateHomework);
router.delete("/:homeworkId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.deleteHomework);

module.exports = router;
