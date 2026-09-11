const router = require("express").Router();
const controller = require("../controllers/notesController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

router.post("/", authenticate, requireRoles("TUTOR", "ADMIN"), controller.createNote);
router.get("/:noteId", authenticate, controller.noteDetail);
router.delete("/:noteId", authenticate, requireRoles("TUTOR", "ADMIN"), controller.deleteNote);

module.exports = router;
