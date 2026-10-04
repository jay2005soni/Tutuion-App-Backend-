const {
  created,
  fail,
  ok,
} = require("../utils/http");

const {
  currentParent,
} = require("../services/permissionService");

const {
  safeUser,
} = require("./authController");

const store =
  require("../services/firestoreService");


// =====================================================
// GET PARENT PROFILE
// =====================================================

async function getProfile(
  req,
  res,
  next
) {
  try {
    const parent =
      await currentParent(req.user.id);

    if (!parent) {
      throw fail(
        404,
        "Parent profile not found",
        "PARENT_NOT_FOUND"
      );
    }

    return ok(
      res,
      "Parent profile fetched successfully",
      {
        ...safeUser(req.user),

        parentId: parent.id,

        status:
          parent.status ||
          req.user.status ||
          "PENDING",
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPDATE PARENT PROFILE
// =====================================================

async function updateProfile(
  req,
  res,
  next
) {
  try {
    const {
      name,
      phone,
      email,
    } = req.body;

    const updated =
      await store.updateDoc(
        "users",
        req.user.id,
        {
          name:
            name ?? req.user.name,

          phone:
            phone ?? req.user.phone,

          email:
            email ?? req.user.email,
        }
      );

    return ok(
      res,
      "Parent profile updated successfully",
      safeUser(updated)
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// GET MY STUDENTS
// =====================================================

async function myStudents(
  req,
  res,
  next
) {
  try {
    const parent =
      await currentParent(req.user.id);

    if (!parent) {
      throw fail(
        404,
        "Parent profile not found",
        "PARENT_NOT_FOUND"
      );
    }

    const students =
      await store.listDocs(
        "students",
        [
          [
            "parentId",
            "==",
            parent.id,
          ],
        ]
      );

    /*
     * Every child has its own approval status.
     *
     * PENDING
     * APPROVED
     * REJECTED
     */

    return ok(
      res,
      "Students fetched successfully",
      {
        students,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// ADD CHILD
// =====================================================

async function addStudent(
  req,
  res,
  next
) {
  try {
    const parent =
      await currentParent(req.user.id);

    if (!parent) {
      throw fail(
        404,
        "Parent profile not found",
        "PARENT_NOT_FOUND"
      );
    }

    /*
     * Only an approved parent can add another child.
     */
    const parentStatus =
      parent.status ||
      req.user.status ||
      "PENDING";

    if (parentStatus !== "APPROVED") {
      throw fail(
        403,
        "Your parent account is still under verification.",
        "PARENT_NOT_APPROVED"
      );
    }

    const {
      name,
      class: studentClass,
      section,
      rollNumber,
    } = req.body;

  if (!name || String(name).trim().length === 0) {
      throw fail(
        422,
        "Student name is required",
        "VALIDATION_ERROR"
      );
    }

    const student =
      await store.createDoc(
        "students",
        {
          name: String(name).trim(),

          class:
            studentClass || null,

          section:
            section || null,

          rollNumber:
            rollNumber || null,

          parentId:
            parent.id,

          tutorId:
            null,

          subjects:
            [],

          /*
           * IMPORTANT:
           * New child always starts as PENDING.
           */
          status:
            "PENDING",
        },
        store.makeId("STU")
      );

    return created(
      res,
      "Child added successfully. Child is under verification.",
      student
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPDATE PARENT STATUS
// TUTOR / ADMIN USE
// =====================================================

async function updateParentStatus(
  req,
  res,
  next
) {
  try {
    const {
      status,
    } = req.body;

    if (
      ![
        "PENDING",
        "APPROVED",
        "REJECTED",
      ].includes(status)
    ) {
      throw fail(
        422,
        "Invalid parent status. Use PENDING, APPROVED or REJECTED.",
        "VALIDATION_ERROR"
      );
    }

    const parent =
      await store.getDoc(
        "parents",
        req.params.parentId
      );

    if (!parent) {
      throw fail(
        404,
        "Parent not found",
        "PARENT_NOT_FOUND"
      );
    }

    /*
     * Update parent document.
     */
    const updatedParent =
      await store.updateDoc(
        "parents",
        parent.id,
        {
          status,
        }
      );

    /*
     * Keep users document status synchronized.
     */
    if (parent.userId) {
      await store.updateDoc(
        "users",
        parent.userId,
        {
          status,
        }
      );
    }

    return ok(
      res,
      `Parent status updated to ${status}`,
      updatedParent
    );
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getProfile,
  updateProfile,
  myStudents,
  addStudent,
  updateParentStatus,
};