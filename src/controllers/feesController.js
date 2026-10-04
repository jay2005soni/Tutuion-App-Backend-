const {
  created,
  fail,
  ok,
} = require("../utils/http");

const {
  requireStudentAccess,
} = require("../services/permissionService");

const store = require("../services/firestoreService");


// =====================================================
// GET FEE SUMMARY
// PARENT
// =====================================================

async function feeSummary(req, res, next) {
  try {
    const studentId = req.params.studentId;

    await requireStudentAccess(
      req.user,
      studentId
    );

    const fees = await store.listDocs(
      "fees",
      [
        ["studentId", "==", studentId],
      ]
    );

    const totalFee = fees.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

    const paid = fees.reduce(
      (sum, item) =>
        sum + Number(item.paidAmount || 0),
      0
    );

    const pending = Math.max(
      0,
      totalFee - paid
    );

    const pendingFees = fees
      .filter(
        (item) =>
          Number(item.dueAmount || 0) > 0
      )
      .sort((a, b) =>
        String(a.dueDate || "")
          .localeCompare(
            String(b.dueDate || "")
          )
      );

    return ok(
      res,
      "Fee summary fetched successfully",
      {
        totalFee,
        paid,
        pending,

        nextDueDate:
          pendingFees[0]?.dueDate || null,

        fees,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// CREATE FEE
// ADMIN / TUTOR
// =====================================================

async function createFee(req, res, next) {
  try {
    const {
      studentId,
      month,
      year,
      amount,
      dueDate,
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!studentId) {
      throw fail(
        422,
        "studentId is required",
        "VALIDATION_ERROR"
      );
    }

    if (
      month === undefined ||
      month === null
    ) {
      throw fail(
        422,
        "month is required",
        "VALIDATION_ERROR"
      );
    }

    if (!year) {
      throw fail(
        422,
        "year is required",
        "VALIDATION_ERROR"
      );
    }

    const feeAmount = Number(amount);

    if (
      !Number.isFinite(feeAmount) ||
      feeAmount <= 0
    ) {
      throw fail(
        422,
        "amount must be greater than 0",
        "VALIDATION_ERROR"
      );
    }

    // -----------------------------------------------
    // STUDENT CHECK
    // -----------------------------------------------

    const student =
      await store.getDoc(
        "students",
        studentId
      );

    if (!student) {
      throw fail(
        404,
        "Student not found",
        "STUDENT_NOT_FOUND"
      );
    }

    // -----------------------------------------------
    // CHECK DUPLICATE MONTHLY FEE
    // -----------------------------------------------

    const existingFees =
      await store.listDocs(
        "fees",
        [
          ["studentId", "==", studentId],
        ]
      );

    const duplicate =
      existingFees.find(
        (item) =>
          Number(item.month) ===
            Number(month) &&
          Number(item.year) ===
            Number(year)
      );

    if (duplicate) {
      throw fail(
        409,
        "Fee for this month already exists",
        "FEE_ALREADY_EXISTS"
      );
    }

    // -----------------------------------------------
    // CREATE FEE
    // -----------------------------------------------

    const fee =
      await store.createDoc(
        "fees",
        {
          studentId,

          month: Number(month),
          year: Number(year),

          amount: feeAmount,

          paidAmount: 0,

          dueAmount: feeAmount,

          status: "pending",

          dueDate:
            dueDate || null,
        },
        store.makeId("FEE")
      );

    return created(
      res,
      "Fee created successfully",
      fee
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPDATE FEE
// ADMIN / TUTOR
// =====================================================

async function updateFee(req, res, next) {
  try {
    const feeId =
      req.params.feeId;

    const fee =
      await store.getDoc(
        "fees",
        feeId
      );

    if (!fee) {
      throw fail(
        404,
        "Fee not found",
        "FEE_NOT_FOUND"
      );
    }

    const {
      amount,
      dueDate,
      month,
      year,
    } = req.body;

    const updateData = {};

    // -----------------------------------------------
    // UPDATE AMOUNT
    // -----------------------------------------------

    if (
      amount !== undefined
    ) {
      const newAmount =
        Number(amount);

      if (
        !Number.isFinite(newAmount) ||
        newAmount <= 0
      ) {
        throw fail(
          422,
          "amount must be greater than 0",
          "VALIDATION_ERROR"
        );
      }

      updateData.amount =
        newAmount;

      const paidAmount =
        Number(
          fee.paidAmount || 0
        );

      updateData.dueAmount =
        Math.max(
          0,
          newAmount - paidAmount
        );

      updateData.status =
        updateData.dueAmount === 0
          ? "paid"
          : paidAmount > 0
          ? "partial"
          : "pending";
    }

    // -----------------------------------------------
    // UPDATE MONTH
    // -----------------------------------------------

    if (
      month !== undefined
    ) {
      updateData.month =
        Number(month);
    }

    // -----------------------------------------------
    // UPDATE YEAR
    // -----------------------------------------------

    if (
      year !== undefined
    ) {
      updateData.year =
        Number(year);
    }

    // -----------------------------------------------
    // UPDATE DUE DATE
    // -----------------------------------------------

    if (
      dueDate !== undefined
    ) {
      updateData.dueDate =
        dueDate || null;
    }

    const updated =
      await store.updateDoc(
        "fees",
        fee.id,
        updateData
      );

    return ok(
      res,
      "Fee updated successfully",
      updated
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// DELETE FEE
// ADMIN / TUTOR
// =====================================================

async function deleteFee(req, res, next) {
  try {
    const feeId =
      req.params.feeId;

    const fee =
      await store.getDoc(
        "fees",
        feeId
      );

    if (!fee) {
      throw fail(
        404,
        "Fee not found",
        "FEE_NOT_FOUND"
      );
    }

    await store.deleteDoc(
      "fees",
      fee.id
    );

    return ok(
      res,
      "Fee deleted successfully",
      fee
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// RECORD MANUAL PAYMENT
// ADMIN / TUTOR
// =====================================================

async function recordPayment(req, res, next) {
  try {
    const feeId =
      req.params.feeId;

    const {
      amount,
      method,
      paymentDate,
    } = req.body;

    const fee =
      await store.getDoc(
        "fees",
        feeId
      );

    if (!fee) {
      throw fail(
        404,
        "Fee not found",
        "FEE_NOT_FOUND"
      );
    }

    const paymentAmount =
      Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      throw fail(
        422,
        "Payment amount must be greater than 0",
        "VALIDATION_ERROR"
      );
    }

    const currentPaid =
      Number(
        fee.paidAmount || 0
      );

    const totalAmount =
      Number(
        fee.amount || 0
      );

    const newPaid =
      currentPaid +
      paymentAmount;

    if (
      newPaid > totalAmount
    ) {
      throw fail(
        422,
        "Payment cannot be greater than remaining fee",
        "INVALID_PAYMENT"
      );
    }

    const newDue =
      Math.max(
        0,
        totalAmount - newPaid
      );

    let status = "pending";

    if (newDue === 0) {
      status = "paid";
    } else if (newPaid > 0) {
      status = "partial";
    }

    const updated =
      await store.updateDoc(
        "fees",
        fee.id,
        {
          paidAmount: newPaid,

          dueAmount: newDue,

          status,
        }
      );

    // -----------------------------------------------
    // SAVE PAYMENT RECORD
    // -----------------------------------------------

    const payment =
      await store.createDoc(
        "payments",
        {
          studentId:
            fee.studentId,

          feeId:
            fee.id,

          amount:
            paymentAmount,

          method:
            method || "MANUAL",

          status:
            "SUCCESS",

          paymentDate:
            paymentDate ||
            new Date()
              .toISOString(),

          source:
            "MANUAL",
        },
        store.makeId("PAY")
      );

    return ok(
      res,
      "Payment recorded successfully",
      {
        fee: updated,
        payment,
      }
    );
  } catch (error) {
    next(error);
  }
}


module.exports = {
  feeSummary,
  createFee,
  updateFee,
  deleteFee,
  recordPayment,
};