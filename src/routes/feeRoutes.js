const router =
  require("express").Router();

const controller =
  require("../controllers/feesController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");


// =====================================================
// ADMIN / TUTOR
// CREATE FEE
// =====================================================

router.post(
  "/",
  authenticate,
  requireRoles("ADMIN", "TUTOR"),
  controller.createFee
);


// =====================================================
// PARENT
// GET CHILD FEE SUMMARY
// =====================================================

router.get(
  "/:studentId",
  authenticate,
  requireRoles("PARENT"),
  controller.feeSummary
);


// =====================================================
// ADMIN / TUTOR
// UPDATE FEE
// =====================================================

router.put(
  "/:feeId",
  authenticate,
  requireRoles("ADMIN", "TUTOR"),
  controller.updateFee
);


// =====================================================
// ADMIN / TUTOR
// DELETE FEE
// =====================================================

router.delete(
  "/:feeId",
  authenticate,
  requireRoles("ADMIN", "TUTOR"),
  controller.deleteFee
);


// =====================================================
// ADMIN / TUTOR
// MANUAL PAYMENT
// =====================================================

router.post(
  "/:feeId/payment",
  authenticate,
  requireRoles("ADMIN", "TUTOR"),
  controller.recordPayment
);


module.exports = router;