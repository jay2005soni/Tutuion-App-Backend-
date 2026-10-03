const router = require("express").Router();

const controller = require("../controllers/testController");

const { authenticate } = require("../middleware/authMiddleware");

const { requireRoles } = require("../middleware/roleMiddleware");

// ===============================
// TEST MANAGEMENT
// ===============================

// Create Test
router.post(
  "/",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.createTest
);

// Get Test Details
router.get(
  "/:testId",
  authenticate,
  controller.testDetails
);

// Update Test
router.put(
  "/:testId",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.updateTest
);

// Delete Test
router.delete(
  "/:testId",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.deleteTest
);


// ===============================
// QUESTIONS
// ===============================

// Get Questions
// Answer is hidden from parent/student
router.get(
  "/:testId/questions",
  authenticate,
  controller.questions
);

// Create Question
router.post(
  "/:testId/questions",
  authenticate,
  requireRoles("TUTOR", "ADMIN"),
  controller.createQuestion
);


// ===============================
// ONLINE TEST
// ===============================

// Start Test
router.post(
  "/:testId/start",
  authenticate,
  controller.startTest
);

// Submit Answer
router.post(
  "/test-attempts/:attemptId/answers",
  authenticate,
  controller.submitAnswer
);

// Submit Complete Test
router.post(
  "/test-attempts/:attemptId/submit",
  authenticate,
  controller.submitTest
);

module.exports = router;