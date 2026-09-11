const router = require("express").Router();
const parentController = require("../controllers/parentController");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, authController.me);
router.put("/", authenticate, parentController.updateProfile);

module.exports = router;
