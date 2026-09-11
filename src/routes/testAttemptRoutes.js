const router = require("express").Router();
const controller = require("../controllers/testController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/:attemptId/answers", authenticate, controller.submitAnswer);
router.post("/:attemptId/submit", authenticate, controller.submitTest);

module.exports = router;
