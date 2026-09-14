const { created, fail, ok } = require("../utils/http");
const { getAuth } = require("../config/firebase");
const store = require("../services/firestoreService");
const { signInWithEmailPassword } = require("../services/firebaseAuthService");
const { ensureProfileFromUid } = require("../services/userProfileService");

function safeUser(user) {
  return { id: user.id, firebaseUid: user.firebaseUid, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

async function register(req, res, next) {
  try {
    const { parentName, email, phone, studentName, password } = req.body;
    if (!parentName || !email || !phone || !studentName || !password) {
      throw fail(422, "parentName, email, phone, studentName and password are required", "VALIDATION_ERROR");
    }
    let firebaseUser;
    try {
      firebaseUser = await getAuth().getUserByEmail(email);
    } catch (error) {
      firebaseUser = await getAuth().createUser({ email, password, displayName: parentName, phoneNumber: phone.startsWith("+") ? phone : undefined });
    }

    const user = await ensureProfileFromUid(firebaseUser.uid, { name: parentName, email, phone, role: "PARENT" });
    let parent = await store.findOne("parents", [["userId", "==", user.id]]);
    if (!parent) {
      parent = await store.createDoc("parents", { userId: user.id, firebaseUid: firebaseUser.uid }, store.makeId("PAR"));
    }
    const student = await store.createDoc("students", {
      name: studentName,
      class: null,
      section: null,
      rollNumber: null,
      parentId: parent.id,
      tutorId: null,
      subjects: [],
      status: "pending_assignment",
    }, store.makeId("STU"));

    return created(res, "Registration successful", { user: { id: user.id, role: user.role }, student });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const authData = await signInWithEmailPassword(email, password);
    const user = await ensureProfileFromUid(authData.localId, { email, role: "PARENT" });
    return ok(res, "Login successful", {
      token: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresIn: authData.expiresIn,
      user: { id: user.id, firebaseUid: user.firebaseUid, name: user.name, role: user.role },
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) throw fail(422, "email is required", "VALIDATION_ERROR");
    const resetLink = await getAuth().generatePasswordResetLink(email);
    return ok(res, "Password reset link generated successfully", { resetLink });
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  return ok(res, "Logout successful", {});
}

function me(req, res) {
  return ok(res, "Current user fetched successfully", safeUser(req.user));
}

module.exports = { register, login, forgotPassword, logout, me, safeUser };
