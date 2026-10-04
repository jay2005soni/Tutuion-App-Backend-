const { ok } = require("../utils/http");
const store = require("../services/firestoreService");

// =====================================================
// GET ANDROID APP UPDATE
// =====================================================

async function getAndroidUpdate(req, res, next) {
  try {
    let update = await store.getDoc(
      "app_update",
      "android"
    );

    // =================================================
    // AUTO CREATE DEFAULT DOCUMENT
    // =================================================

    if (!update) {
      update = await store.createDoc(
        "app_update",
        {
          latestVersion: "1.0.0",
          apkUrl: "",
        },
        "android"
      );
    }

    return ok(
      res,
      "Android app update information fetched successfully",
      {
        latestVersion:
          update.latestVersion?.toString() || "",

        apkUrl:
          update.apkUrl?.toString() || "",
      }
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAndroidUpdate,
};