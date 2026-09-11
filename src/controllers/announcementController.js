const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function createAnnouncement(req, res) {
  const announcement = { id: id("ANN"), ...req.body };
  db.announcements.push(announcement);
  return created(res, "Announcement created successfully", announcement);
}

function getStudentAnnouncements(req, res, next) {
  try {
    requireStudentAccess(req.user, req.params.studentId);
    return ok(res, "Announcements fetched successfully", { announcements: db.announcements });
  } catch (error) {
    next(error);
  }
}

function announcementDetail(req, res, next) {
  try {
    const announcement = db.announcements.find((item) => item.id === req.params.announcementId);
    if (!announcement) throw fail(404, "Announcement not found", "ANNOUNCEMENT_NOT_FOUND");
    return ok(res, "Announcement fetched successfully", announcement);
  } catch (error) {
    next(error);
  }
}

module.exports = { createAnnouncement, getStudentAnnouncements, announcementDetail };
