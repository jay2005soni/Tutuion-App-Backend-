const { ok, fail } = require("../utils/http");
const store = require("../services/firestoreService");

// =====================================================
// GET ANDROID APP UPDATE
// =====================================================

async function getAndroidUpdate(req, res, next) {
  try {
    const update = await store.getDoc(
      "app_update",
      "android"
    );

    // Document doesn't exist
    if (!update) {
      return ok(
        res,
        "No app update is currently available",
        {
          latestVersion: "",
          apkUrl: "",
        }
      );
    }

    const latestVersion =
      update.latestVersion?.toString().trim() || "";

    const apkUrl =
      update.apkUrl?.toString().trim() || "";

    return ok(
      res,
      "Android app update information fetched successfully",
      {
        latestVersion,
        apkUrl,
      }
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAndroidUpdate,
};