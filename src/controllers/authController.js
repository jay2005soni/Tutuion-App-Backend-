const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createToken } = require("../utils/token");

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

function register(req, res, next) {
  try {
    const { parentName, email, phone, studentName, password } = req.body;
    if (!parentName || !email || !phone || !studentName || !password) {
      throw fail(422, "parentName, email, phone, studentName and password are required", "VALIDATION_ERROR");
    }
    if (db.users.some((user) => user.email === email)) {
      throw fail(409, "Email already registered", "EMAIL_EXISTS");
    }

    const user = { id: id("USR"), name: parentName, email, phone, role: "PARENT", passwordHash: hashPassword(password) };
    const parent = { id: id("PAR"), userId: user.id };
    const student = {
      id: id("STU"),
      name: studentName,
      class: null,
      section: null,
      rollNumber: null,
      parentId: parent.id,
      tutorId: null,
      subjects: [],
      status: "pending_assignment",
    };

    db.users.push(user);
    db.parents.push(parent);
    db.students.push(student);

    return created(res, "Registration successful", { user: { id: user.id, role: user.role }, student });
  } catch (error) {
    next(error);
  }
}

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = db.users.find((item) => item.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw fail(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }
    const token = createToken({ userId: user.id, role: user.role });
    return ok(res, "Login successful", { token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
}

function forgotPassword(req, res, next) {
  try {
    if (!req.body.email) throw fail(422, "email is required", "VALIDATION_ERROR");
    return ok(res, "Password reset email sent", {});
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
