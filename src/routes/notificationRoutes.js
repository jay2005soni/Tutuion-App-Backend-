const router = require("express").Router();
const controller = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, controller.getNotifications);
router.patch("/read-all", authenticate, controller.markAllRead);
router.patch("/:notificationId/read", authenticate, controller.markRead);

module.exports = router;
