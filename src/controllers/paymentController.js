const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const { createOrder, receiptUrl } = require("../services/paymentService");

function createPaymentOrder(req, res, next) {
  try {
    const fee = db.fees.find((item) => item.id === req.body.feeId);
    if (!fee) throw fail(404, "Fee not found", "FEE_NOT_FOUND");
    requireStudentAccess(req.user, fee.studentId);
    return created(res, "Payment order created successfully", createOrder(fee, req.body.amount || fee.amount));
  } catch (error) {
    next(error);
  }
}

function verifyPayment(req, res, next) {
  try {
    const fee = db.fees.find((item) => item.id === req.body.feeId);
    if (!fee) throw fail(404, "Fee not found", "FEE_NOT_FOUND");
    requireStudentAccess(req.user, fee.studentId);
    fee.status = "paid";
    const payment = {
      id: id("PAY"),
      feeId: fee.id,
      studentId: fee.studentId,
      amount: req.body.amount || fee.amount,
      transactionId: req.body.transactionId || `TXN_${Date.now()}`,
      status: "success",
      date: new Date().toISOString().slice(0, 10),
    };
    payment.receiptUrl = receiptUrl(payment.id);
    db.payments.push(payment);
    return ok(res, "Payment verified successfully", payment);
  } catch (error) {
    next(error);
  }
}

function paymentHistory(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Payment history fetched successfully", { payments: db.payments.filter((item) => item.studentId === req.params.studentId) });
  } catch (error) {
    next(error);
  }
}

function receipt(req, res, next) {
  try {
    const payment = db.payments.find((item) => item.id === req.params.paymentId);
    if (!payment) throw fail(404, "Payment not found", "PAYMENT_NOT_FOUND");
    requireStudentAccess(req.user, payment.studentId);
    res.type("text/plain").send(`Receipt\nPayment ID: ${payment.id}\nAmount: INR ${payment.amount}\nStatus: ${payment.status}\nDate: ${payment.date}\n`);
  } catch (error) {
    next(error);
  }
}

module.exports = { createPaymentOrder, verifyPayment, paymentHistory, receipt };
