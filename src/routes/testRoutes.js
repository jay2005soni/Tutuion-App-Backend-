const router = require("express").Router();
const controller = require("../controllers/testController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createTest);
router.get("/:testId", authenticate, controller.testDetails);
router.put("/:testId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.updateTest);
router.delete("/:testId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.deleteTest);
router.get("/:testId/questions", authenticate, controller.questions);
router.post("/:testId/start", authenticate, controller.startTest);

module.exports = router;
