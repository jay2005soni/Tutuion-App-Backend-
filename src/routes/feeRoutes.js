const router = require("express").Router();
const controller = require("../controllers/feesController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("ADMIN"), controller.createFee);

module.exports = router;
