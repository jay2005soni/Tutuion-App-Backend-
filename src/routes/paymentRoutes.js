const router = require("express").Router();
const controller = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/create-order", authenticate, controller.createPaymentOrder);
router.post("/verify", authenticate, controller.verifyPayment);
router.get("/:paymentId/receipt", authenticate, controller.receipt);

module.exports = router;
