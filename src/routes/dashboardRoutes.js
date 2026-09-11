const router = require("express").Router();
const { parentDashboard } = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.get("/dashboard", authenticate, requireRoles("PARENT"), parentDashboard);

module.exports = router;
