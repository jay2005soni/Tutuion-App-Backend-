const { fail } = require("../utils/http");
const store = require("./firestoreService");


// =====================================================
// GET CURRENT PARENT
// =====================================================

async function currentParent(userId) {
  return store.findOne(
    "parents",
    [
      ["userId", "==", userId],
    ]
  );
}


// =====================================================
// GET CURRENT TUTOR
// =====================================================

async function currentTutor(userId) {
  return store.findOne(
    "tutors",
    [
      ["userId", "==", userId],
    ]
  );
}


// =====================================================
// CHECK PARENT APPROVAL
// =====================================================

async function isParentApproved(userId) {
  const parent =
    await currentParent(userId);

  if (!parent) {
    return false;
  }

  return (
    parent.status === "APPROVED"
  );
}


// =====================================================
// CHECK STUDENT APPROVAL
// =====================================================

function isStudentApproved(student) {
  if (!student) {
    return false;
  }

  return (
    student.status === "APPROVED"
  );
}


// =====================================================
// CHECK STUDENT ACCESS
// =====================================================

async function canAccessStudent(
  user,
  student
) {
  /*
   * Student must exist.
   */
  if (!student) {
    return false;
  }


  // ===================================================
  // ADMIN
  // ===================================================

  /*
   * Admin can access students regardless of
   * parent/student approval status.
   *
   * This is important because Admin/Tutor must be
   * able to review and approve pending students.
   */
  if (user.role === "ADMIN") {
    return true;
  }


  // ===================================================
  // PARENT
  // ===================================================

  if (user.role === "PARENT") {
    const parent =
      await currentParent(user.id);

    /*
     * Parent profile must exist.
     */
    if (!parent) {
      return false;
    }

    /*
     * Parent can only access their own child.
     */
    if (
      parent.id !== student.parentId
    ) {
      return false;
    }

    /*
     * Parent account must be APPROVED.
     */
    if (
      parent.status !== "APPROVED"
    ) {
      return false;
    }

    /*
     * Child must also be APPROVED.
     */
    if (
      student.status !== "APPROVED"
    ) {
      return false;
    }

    return true;
  }


  // ===================================================
  // TUTOR
  // ===================================================

  if (user.role === "TUTOR") {
    const tutor =
      await currentTutor(user.id);

    if (!tutor) {
      return false;
    }

    /*
     * Tutor can access students assigned to them.
     *
     * We intentionally allow Tutor to access
     * PENDING students because Tutor/Admin needs
     * to review and approve them.
     */
    return (
      tutor.id === student.tutorId
    );
  }


  // ===================================================
  // OTHER ROLES
  // ===================================================

  return false;
}


// =====================================================
// REQUIRE STUDENT ACCESS
// =====================================================

async function requireStudentAccess(
  user,
  studentId
) {
  const student =
    await store.getDoc(
      "students",
      studentId
    );

  /*
   * Student does not exist.
   */
  if (!student) {
    throw fail(
      404,
      "Student not found",
      "STUDENT_NOT_FOUND"
    );
  }


  /*
   * Check access according to role,
   * parent approval and student approval.
   */
  const allowed =
    await canAccessStudent(
      user,
      student
    );

  if (!allowed) {

    /*
     * For PARENT, give a useful message.
     * This will help Flutter show the correct
     * Under Verification screen.
     */

    if (user.role === "PARENT") {

      const parent =
        await currentParent(
          user.id
        );

      /*
       * Parent itself is pending/rejected.
       */
      if (
        !parent ||
        parent.status !== "APPROVED"
      ) {
        throw fail(
          403,
          "Your account is under verification.",
          "PARENT_NOT_APPROVED"
        );
      }


      /*
       * Parent approved but child is not.
       */
      if (
        student.parentId === parent.id &&
        student.status !== "APPROVED"
      ) {
        throw fail(
          403,
          "This child is under verification.",
          "STUDENT_NOT_APPROVED"
        );
      }
    }


    throw fail(
      403,
      "Forbidden",
      "FORBIDDEN"
    );
  }

  return student;
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  currentParent,
  currentTutor,
  isParentApproved,
  isStudentApproved,
  canAccessStudent,
  requireStudentAccess,
};