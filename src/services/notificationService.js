const { db, id } = require("../config/database");

function createNotification(userId, title, message) {
  const notification = { id: id("N"), userId, title, message, isRead: false, createdAt: new Date().toISOString() };
  db.notifications.push(notification);
  return notification;
}

function sendPushPlaceholder(notification) {
  return { queued: true, provider: "FCM_PLACEHOLDER", notificationId: notification.id };
}

module.exports = { createNotification, sendPushPlaceholder };
