const { db } = require("../config/database");
const { fail, ok } = require("../utils/http");
const { currentParent } = require("../services/permissionService");
const { safeUser } = require("./authController");

function getProfile(req, res, next) {
  try {
    const parent = currentParent(req.user.id);
    if (!parent) throw fail(404, "Parent profile not found", "PARENT_NOT_FOUND");
    return ok(res, "Parent profile fetched successfully", { ...safeUser(req.user), parentId: parent.id });
  } catch (error) {
    next(error);
  }
}

function updateProfile(req, res, next) {
  try {
    const { name, phone, email } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (email !== undefined) req.user.email = email;
    return ok(res, "Parent profile updated successfully", safeUser(req.user));
  } catch (error) {
    next(error);
  }
}

function myStudents(req, res, next) {
  try {
    const parent = currentParent(req.user.id);
    if (!parent) throw fail(404, "Parent profile not found", "PARENT_NOT_FOUND");
    const students = db.students.filter((student) => student.parentId === parent.id);
    return ok(res, "Students fetched successfully", { students });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, myStudents };
