const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function createAnnouncement(req, res, next) {
  try {
  const announcement = await store.createDoc("announcements", req.body, store.makeId("ANN"));
  return created(res, "Announcement created successfully", announcement);
  } catch (error) {
    next(error);
  }
}

async function getStudentAnnouncements(req, res, next) {
  try {
    await requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Announcements fetched successfully", { announcements: await store.listDocs("announcements") });
  } catch (error) {
    next(error);
  }
}

async function announcementDetail(req, res, next) {
  try {
    const announcement = await store.getDoc("announcements", req.params.announcementId);
    if (!announcement) throw fail(404, "Announcement not found", "ANNOUNCEMENT_NOT_FOUND");
    return ok(res, "Announcement fetched successfully", announcement);
  } catch (error) {
    next(error);
  }
}

module.exports = { createAnnouncement, getStudentAnnouncements, announcementDetail };
