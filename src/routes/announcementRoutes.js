const router = require("express").Router();
const controller = require("../controllers/announcementController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createAnnouncement);
router.get("/:announcementId", authenticate, controller.announcementDetail);

module.exports = router;
