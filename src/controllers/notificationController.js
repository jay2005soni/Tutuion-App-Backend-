const { fail, ok } = require("../utils/http");
const store = require("../services/firestoreService");

async function getNotifications(req, res, next) {
  try {
    return ok(res, "Notifications fetched successfully", { notifications: await store.listDocs("notifications", [["userId", "==", req.user.id]]) });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await store.getDoc("notifications", req.params.notificationId);
    if (!notification) throw fail(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    if (notification.userId !== req.user.id) throw fail(403, "Forbidden", "FORBIDDEN");
    return ok(res, "Notification marked as read", await store.updateDoc("notifications", notification.id, { isRead: true }));
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const notifications = await store.listDocs("notifications", [["userId", "==", req.user.id]]);
    await Promise.all(notifications.map((item) => store.updateDoc("notifications", item.id, { isRead: true })));
    return ok(res, "All notifications marked as read", {});
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotifications, markRead, markAllRead };
