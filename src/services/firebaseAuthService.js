const { getAuth } = require("../config/firebase");
const { env } = require("../config/env");

function firebaseConfigured() {
  return Boolean(env.firebaseServiceAccountPath || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

async function verifyFirebaseIdToken(token) {
  if (!firebaseConfigured()) return null;
  try {
    return await getAuth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

module.exports = { firebaseConfigured, verifyFirebaseIdToken };
