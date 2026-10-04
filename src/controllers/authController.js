const { created, fail, ok } = require("../utils/http");
const { getAuth } = require("../config/firebase");
const store = require("../services/firestoreService");
const {
  signInWithEmailPassword,
} = require("../services/firebaseAuthService");
const {
  ensureProfileFromUid,
} = require("../services/userProfileService");

function safeUser(user) {
  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status || "PENDING",
  };
}

async function register(req, res, next) {
  try {
    const {
      parentName,
      email,
      phone,
      studentName,
      password,
    } = req.body;

    if (
      !parentName ||
      !email ||
      !phone ||
      !studentName ||
      !password
    ) {
      throw fail(
        422,
        "parentName, email, phone, studentName and password are required",
        "VALIDATION_ERROR"
      );
    }

    let firebaseUser;

    try {
      firebaseUser = await getAuth().getUserByEmail(email);
    } catch (error) {
      firebaseUser = await getAuth().createUser({
        email,
        password,
        displayName: parentName,
        phoneNumber: phone.startsWith("+")
          ? phone
          : undefined,
      });
    }

    /*
     * New parent registration always starts as PENDING.
     */
    const user = await ensureProfileFromUid(
      firebaseUser.uid,
      {
        name: parentName,
        email,
        phone,
        role: "PARENT",
      }
    );

    /*
     * Explicitly save PENDING status.
     * This makes sure an old/existing profile cannot
     * accidentally become APPROVED during registration.
     */
    const updatedUser = await store.updateDoc(
      "users",
      user.id,
      {
        name: parentName,
        email,
        phone,
        role: "PARENT",
        status: "PENDING",
      }
    );

    let parent = await store.findOne(
      "parents",
      [["userId", "==", updatedUser.id]]
    );

    if (!parent) {
      parent = await store.createDoc(
        "parents",
        {
          userId: updatedUser.id,
          firebaseUid: firebaseUser.uid,
          status: "PENDING",
        },
        store.makeId("PAR")
      );
    } else {
      parent = await store.updateDoc(
        "parents",
        parent.id,
        {
          status: "PENDING",
        }
      );
    }

    /*
     * First child is also PENDING.
     */
    const student = await store.createDoc(
      "students",
      {
        name: studentName,
        class: null,
        section: null,
        rollNumber: null,
        parentId: parent.id,
        tutorId: null,
        subjects: [],
        status: "PENDING",
      },
      store.makeId("STU")
    );

    return created(
      res,
      "Registration successful. Your account is under verification.",
      {
        user: {
          id: updatedUser.id,
          firebaseUid: updatedUser.firebaseUid,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          status: "PENDING",
        },

        parent: {
          id: parent.id,
          status: "PENDING",
        },

        student,
      }
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      throw fail(
        422,
        "email and password are required",
        "VALIDATION_ERROR"
      );
    }

    const authData =
      await signInWithEmailPassword(
        email,
        password
      );

    const user =
      await ensureProfileFromUid(
        authData.localId,
        {
          email,
          role: "PARENT",
        }
      );

    /*
     * Get parent profile so the app can know
     * whether the parent is approved.
     */
    const parent = await store.findOne(
      "parents",
      [["userId", "==", user.id]]
    );

    const status =
      user.status ||
      parent?.status ||
      "PENDING";

    return ok(
      res,
      "Login successful",
      {
        token: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: authData.expiresIn,

        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status,
        },

        parent: parent
          ? {
              id: parent.id,
              status:
                parent.status || status,
            }
          : null,
      }
    );
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(
  req,
  res,
  next
) {
  try {
    const { email } = req.body;

    if (!email) {
      throw fail(
        422,
        "email is required",
        "VALIDATION_ERROR"
      );
    }

    const resetLink =
      await getAuth().generatePasswordResetLink(
        email
      );

    return ok(
      res,
      "Password reset link generated successfully",
      {
        resetLink,
      }
    );
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  return ok(
    res,
    "Logout successful",
    {}
  );
}

function me(req, res) {
  return ok(
    res,
    "Current user fetched successfully",
    safeUser(req.user)
  );
}

module.exports = {
  register,
  login,
  forgotPassword,
  logout,
  me,
  safeUser,
};