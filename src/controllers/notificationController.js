const { db } = require("../config/database");
const { fail, ok } = require("../utils/http");

function getNotifications(req, res) {
  return ok(res, "Notifications fetched successfully", { notifications: db.notifications.filter((item) => item.userId === req.user.id) });
}

function markRead(req, res, next) {
  try {
    const notification = db.notifications.find((item) => item.id === req.params.notificationId && item.userId === req.user.id);
    if (!notification) throw fail(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    notification.isRead = true;
    return ok(res, "Notification marked as read", notification);
  } catch (error) {
    next(error);
  }
}

function markAllRead(req, res) {
  db.notifications.filter((item) => item.userId === req.user.id).forEach((item) => {
    item.isRead = true;
  });
  return ok(res, "All notifications marked as read", {});
}

module.exports = { getNotifications, markRead, markAllRead };
