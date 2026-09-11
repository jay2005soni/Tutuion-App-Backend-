const router = require("express").Router();
const controller = require("../controllers/parentController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.get("/me", authenticate, requireRoles("PARENT"), controller.getProfile);
router.put("/me", authenticate, requireRoles("PARENT"), controller.updateProfile);
router.get("/me/students", authenticate, requireRoles("PARENT"), controller.myStudents);

module.exports = router;
