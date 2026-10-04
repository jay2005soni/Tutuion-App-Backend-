const crypto = require("crypto");

const razorpay = require("../services/razorpayService");
const store = require("../services/firestoreService");
const { ok, created } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

async function createOrder(req, res, next) {
  try {
    const { feeId } = req.body;

    if (!feeId) {
      return res.status(400).json({
        success: false,
        message: "feeId is required",
      });
    }

    const fee = await store.getDoc("fees", feeId);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    await requireStudentAccess(
      req.user,
      fee.studentId
    );

    const dueAmount = Number(
      fee.dueAmount ?? 0
    );

    if (dueAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No amount is due for this fee",
      });
    }

    // Razorpay amount is in paise.
    const amountInPaise =
      Math.round(dueAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `fee_${feeId}`,
      notes: {
        feeId,
        studentId: fee.studentId,
      },
    });

    return created(
      res,
      "Razorpay order created successfully",
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId:
          process.env.RAZORPAY_KEY_ID,
        feeId,
        studentId:
          fee.studentId,
      }
    );
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !feeId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification data is incomplete",
      });
    }

    const fee =
      await store.getDoc(
        "fees",
        feeId
      );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    await requireStudentAccess(
      req.user,
      fee.studentId
    );

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature",
      });
    }

    const payment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has not been captured",
      });
    }

    const paidAmount =
      Number(payment.amount) / 100;

    const currentPaid =
      Number(fee.paidAmount || 0);

    const currentDue =
      Number(fee.dueAmount || 0);

    const newPaid =
      currentPaid + paidAmount;

    const newDue = Math.max(
      currentDue - paidAmount,
      0
    );

    let status = "pending";

    if (newDue <= 0) {
      status = "paid";
    } else if (newPaid > 0) {
      status = "partial";
    }

    await store.updateDoc(
      "fees",
      feeId,
      {
        paidAmount: newPaid,
        dueAmount: newDue,
        status,
      }
    );

    const paymentRecord =
      await store.createDoc(
        "payments",
        {
          studentId:
            fee.studentId,

          feeId,

          amount:
            paidAmount,

          method:
            "RAZORPAY",

          status:
            "SUCCESS",

          paymentDate:
            new Date().toISOString(),

          source:
            "RAZORPAY",

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,
        },
        store.makeId("PAY")
      );

    return ok(
      res,
      "Payment verified successfully",
      {
        payment: paymentRecord,

        fee: {
          id: feeId,
          paidAmount: newPaid,
          dueAmount: newDue,
          status,
        },
      }
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
};