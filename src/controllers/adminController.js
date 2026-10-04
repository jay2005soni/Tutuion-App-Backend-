const { created, fail, ok } = require("../utils/http");
const { getAuth } = require("../config/firebase");
const store = require("../services/firestoreService");


// =====================================================
// ADMIN DASHBOARD
// =====================================================

async function dashboard(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const students = await store.listDocs("students");
    const tutors = await store.listDocs("tutors");

    const todayRecords = await store.listDocs(
      "attendance",
      [["date", "==", today]]
    );

    const fees = await store.listDocs("fees");

    const pendingFees = fees
      .filter((item) => item.status !== "paid")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    return ok(
      res,
      "Admin dashboard fetched successfully",
      {
        totalStudents: students.length,
        totalTutors: tutors.length,

        todayPresent: todayRecords.filter(
          (item) => item.status === "present"
        ).length,

        todayAbsent: todayRecords.filter(
          (item) => item.status === "absent"
        ).length,

        pendingFees,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// LIST ALL STUDENTS
// =====================================================

async function listStudents(req, res, next) {
  try {
    const students = await store.listDocs("students");

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
// DEACTIVATE STUDENT
// =====================================================

async function deactivateStudent(req, res, next) {
  try {
    const student = await store.getDoc(
      "students",
      req.params.studentId
    );

    if (!student) {
      throw fail(
        404,
        "Student not found",
        "STUDENT_NOT_FOUND"
      );
    }

    const updated = await store.updateDoc(
      "students",
      student.id,
      {
        status: "inactive",
      }
    );

    return ok(
      res,
      "Student deactivated successfully",
      updated
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// LIST ALL PARENTS
// =====================================================
// =====================================================
// LIST ALL PARENTS
// =====================================================

async function listParents(req, res, next) {
  try {
    const parents = await store.listDocs("parents");

    const data = await Promise.all(
      parents.map(async (parent) => {
        let user = null;
        let students = [];

        // ---------------------------------------------
        // Get parent user safely
        // ---------------------------------------------
        if (
          parent.userId &&
          String(parent.userId).trim().length > 0
        ) {
          user = await store.getDoc(
            "users",
            String(parent.userId).trim()
          );
        }

        // ---------------------------------------------
        // Get children safely
        // ---------------------------------------------
        if (
          parent.id &&
          String(parent.id).trim().length > 0
        ) {
          students = await store.listDocs(
            "students",
            [
              [
                "parentId",
                "==",
                String(parent.id).trim(),
              ],
            ]
          );
        }

        return {
          ...parent,
          user,
          students,
        };
      })
    );

    return ok(
      res,
      "Parents fetched successfully",
      {
        parents: data,
      }
    );
  } catch (error) {
    next(error);
  }
}
// =====================================================
// UPDATE PARENT
// =====================================================

async function updateParent(req, res, next) {
  try {
    const parent = await store.getDoc(
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

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (
      req.body.status &&
      !allowedStatuses.includes(
        String(req.body.status).toUpperCase()
      )
    ) {
      throw fail(
        422,
        "Invalid parent status",
        "VALIDATION_ERROR"
      );
    }

    const userUpdates = {};

    if (req.body.name !== undefined) {
      userUpdates.name = req.body.name;
    }

    if (req.body.email !== undefined) {
      userUpdates.email = req.body.email;
    }

    if (req.body.phone !== undefined) {
      userUpdates.phone = req.body.phone;
    }

    if (req.body.status !== undefined) {
      userUpdates.status =
        String(req.body.status).toUpperCase();
    }

    let user = await store.getDoc(
      "users",
      parent.userId
    );

    if (Object.keys(userUpdates).length > 0) {
      user = await store.updateDoc(
        "users",
        parent.userId,
        userUpdates
      );
    }

    const parentUpdates = {};

    if (req.body.status !== undefined) {
      parentUpdates.status =
        String(req.body.status).toUpperCase();
    }

    const updatedParent =
      Object.keys(parentUpdates).length > 0
        ? await store.updateDoc(
            "parents",
            parent.id,
            parentUpdates
          )
        : parent;

    return ok(
      res,
      "Parent updated successfully",
      {
        parent: updatedParent,
        user,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// APPROVE / REJECT PARENT
// =====================================================

async function updateParentStatus(req, res, next) {
  try {
    const parent = await store.getDoc(
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

    const status = String(
      req.body.status || ""
    ).toUpperCase();

    if (
      !["PENDING", "APPROVED", "REJECTED"].includes(status)
    ) {
      throw fail(
        422,
        "Status must be PENDING, APPROVED or REJECTED",
        "VALIDATION_ERROR"
      );
    }

    const updatedParent = await store.updateDoc(
      "parents",
      parent.id,
      {
        status,
      }
    );

    // Keep users collection status in sync
    const updatedUser = await store.updateDoc(
      "users",
      parent.userId,
      {
        status,
      }
    );

    return ok(
      res,
      `Parent status updated to ${status}`,
      {
        parent: updatedParent,
        user: updatedUser,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// LIST ALL TUTORS
// =====================================================

async function listTutors(req, res, next) {
  try {
    const tutors = await store.listDocs("tutors");

    const data = await Promise.all(
      tutors.map(async (tutor) => ({
        ...tutor,
        user: await store.getDoc(
          "users",
          tutor.userId
        ),
      }))
    );

    return ok(
      res,
      "Tutors fetched successfully",
      {
        tutors: data,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// CREATE TUTOR
// =====================================================

async function createTutor(req, res, next) {
  try {
    const firebaseUser = await getAuth().createUser({
      email: req.body.email,
      password: req.body.password || "tutor123",
      displayName: req.body.name,
      phoneNumber:
        req.body.phone?.startsWith("+")
          ? req.body.phone
          : undefined,
    });

    const user = await store.createDoc(
      "users",
      {
        firebaseUid: firebaseUser.uid,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: "TUTOR",
        status: "APPROVED",
      },
      store.makeId("USR")
    );

    const tutor = await store.createDoc(
      "tutors",
      {
        userId: user.id,
        firebaseUid: firebaseUser.uid,
        classes: req.body.classes || [],
        status: "APPROVED",
      },
      store.makeId("TUT")
    );

    return created(
      res,
      "Tutor created successfully",
      {
        tutor,
        user,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// UPDATE TUTOR
// =====================================================

async function updateTutor(req, res, next) {
  try {
    const tutor = await store.getDoc(
      "tutors",
      req.params.tutorId
    );

    if (!tutor) {
      throw fail(
        404,
        "Tutor not found",
        "TUTOR_NOT_FOUND"
      );
    }

    const user = await store.updateDoc(
      "users",
      tutor.userId,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: "TUTOR",
      }
    );

    const updatedTutor = await store.updateDoc(
      "tutors",
      tutor.id,
      {
        classes:
          req.body.classes ?? tutor.classes,
      }
    );

    return ok(
      res,
      "Tutor updated successfully",
      {
        tutor: updatedTutor,
        user,
      }
    );
  } catch (error) {
    next(error);
  }
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  dashboard,
  listStudents,
  deactivateStudent,

  listParents,
  updateParent,
  updateParentStatus,

  listTutors,
  createTutor,
  updateTutor,
};