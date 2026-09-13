const store = require("./firestoreService");

async function createNotification(userId, title, message) {
  return store.createDoc("notifications", { userId, title, message, isRead: false }, store.makeId("N"));
}

function sendPushPlaceholder(notification) {
  return { queued: true, provider: "FCM_PLACEHOLDER", notificationId: notification.id };
}

module.exports = { createNotification, sendPushPlaceholder };
