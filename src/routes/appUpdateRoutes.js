const router = require("express").Router();

const controller = require("../controllers/appUpdateController");

// =====================================================
// ANDROID APP UPDATE
// =====================================================

router.get(
  "/android",
  controller.getAndroidUpdate
);

module.exports = router;