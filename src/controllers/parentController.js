const { fail, ok } = require("../utils/http");
const { currentParent } = require("../services/permissionService");
const { safeUser } = require("./authController");
const store = require("../services/firestoreService");

async function getProfile(req, res, next) {
  try {
    const parent = await currentParent(req.user.id);
    if (!parent) throw fail(404, "Parent profile not found", "PARENT_NOT_FOUND");
    return ok(res, "Parent profile fetched successfully", { ...safeUser(req.user), parentId: parent.id });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, email } = req.body;
    const updated = await store.updateDoc("users", req.user.id, {
      name: name ?? req.user.name,
      phone: phone ?? req.user.phone,
      email: email ?? req.user.email,
    });
    return ok(res, "Parent profile updated successfully", safeUser(updated));
  } catch (error) {
    next(error);
  }
}

async function myStudents(req, res, next) {
  try {
    const parent = await currentParent(req.user.id);
    if (!parent) throw fail(404, "Parent profile not found", "PARENT_NOT_FOUND");
    const students = await store.listDocs("students", [["parentId", "==", parent.id]]);
    return ok(res, "Students fetched successfully", { students });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, myStudents };
