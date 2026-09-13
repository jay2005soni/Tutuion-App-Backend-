const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { createOrder, receiptUrl } = require("../services/paymentService");
const store = require("../services/firestoreService");

async function createPaymentOrder(req, res, next) {
  try {
    const fee = await store.getDoc("fees", req.body.feeId);
    if (!fee) throw fail(404, "Fee not found", "FEE_NOT_FOUND");
    await requireStudentAccess(req.user, fee.studentId);
    return created(res, "Payment order created successfully", createOrder(fee, req.body.amount || fee.amount));
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const fee = await store.getDoc("fees", req.body.feeId);
    if (!fee) throw fail(404, "Fee not found", "FEE_NOT_FOUND");
    await requireStudentAccess(req.user, fee.studentId);
    await store.updateDoc("fees", fee.id, { status: "paid" });
    const payment = await store.createDoc("payments", {
      feeId: fee.id,
      studentId: fee.studentId,
      amount: req.body.amount || fee.amount,
      transactionId: req.body.transactionId || `TXN_${Date.now()}`,
      status: "success",
      date: new Date().toISOString().slice(0, 10),
    }, store.makeId("PAY"));
    const updated = await store.updateDoc("payments", payment.id, { receiptUrl: receiptUrl(payment.id) });
    return ok(res, "Payment verified successfully", updated);
  } catch (error) {
    next(error);
  }
}

async function paymentHistory(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Payment history fetched successfully", { payments: await store.listDocs("payments", [["studentId", "==", req.params.studentId]]) });
  } catch (error) {
    next(error);
  }
}

async function receipt(req, res, next) {
  try {
    const payment = await store.getDoc("payments", req.params.paymentId);
    if (!payment) throw fail(404, "Payment not found", "PAYMENT_NOT_FOUND");
    await requireStudentAccess(req.user, payment.studentId);
    res.type("text/plain").send(`Receipt\nPayment ID: ${payment.id}\nAmount: INR ${payment.amount}\nStatus: ${payment.status}\nDate: ${payment.date}\n`);
  } catch (error) {
    next(error);
  }
}

module.exports = { createPaymentOrder, verifyPayment, paymentHistory, receipt };
