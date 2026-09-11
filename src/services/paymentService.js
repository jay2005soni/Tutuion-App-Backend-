const { env } = require("../config/env");

function createOrder(fee, amount) {
  return {
    orderId: `ORDER_${Date.now()}`,
    feeId: fee.id,
    amount,
    currency: "INR",
    status: "created",
  };
}

function receiptUrl(paymentId) {
  return `${env.appBaseUrl}/api/v1/payments/${paymentId}/receipt`;
}

module.exports = { createOrder, receiptUrl };
