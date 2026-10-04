const router = require("express").Router();

const controller =
  require("../controllers/paymentController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

router.post(
  "/order",
  authenticate,
  controller.createOrder
);

router.post(
  "/verify",
  authenticate,
  controller.verifyPayment
);

module.exports = router;