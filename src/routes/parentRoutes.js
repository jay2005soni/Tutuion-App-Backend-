const router = require("express").Router();

const controller =
  require("../controllers/parentController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");


// =====================================================
// PARENT PROFILE
// =====================================================

router.get(
  "/me",
  authenticate,
  requireRoles("PARENT"),
  controller.getProfile
);


// =====================================================
// UPDATE PARENT PROFILE
// =====================================================

router.put(
  "/me",
  authenticate,
  requireRoles("PARENT"),
  controller.updateProfile
);


// =====================================================
// GET MY CHILDREN
// =====================================================

router.get(
  "/me/students",
  authenticate,
  requireRoles("PARENT"),
  controller.myStudents
);


// =====================================================
// ADD CHILD
// =====================================================

router.post(
  "/me/students",
  authenticate,
  requireRoles("PARENT"),
  controller.addStudent
);


module.exports = router;