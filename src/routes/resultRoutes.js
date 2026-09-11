const router = require("express").Router();
const controller = require("../controllers/resultController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.get("/:resultId", authenticate, controller.resultDetail);
router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createResult);
router.put("/:resultId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.updateResult);

module.exports = router;
