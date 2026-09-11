const { db, id } = require("../config/database");
const { created, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function feeSummary(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    const fees = db.fees.filter((item) => item.studentId === req.params.studentId);
    const totalFee = fees.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const paid = fees.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingFees = fees.filter((item) => item.status !== "paid");
    return ok(res, "Fee summary fetched successfully", {
      totalFee,
      paid,
      pending: totalFee - paid,
      nextDueDate: pendingFees.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))[0]?.dueDate || null,
      fees,
    });
  } catch (error) {
    next(error);
  }
}

function createFee(req, res, next) {
  try {
    requireStudentAccess(req.user, req.body.studentId);
    const fee = { id: id("FEE"), status: "pending", ...req.body };
    db.fees.push(fee);
    return created(res, "Fee created successfully", fee);
  } catch (error) {
    next(error);
  }
}

module.exports = { feeSummary, createFee };
