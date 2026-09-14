const { getAuth } = require("../config/firebase");
const { env } = require("../config/env");
const { fail } = require("../utils/http");

function firebaseConfigured() {
  return Boolean(env.firebaseServiceAccountPath || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}
async function verifyFirebaseIdToken(token) {
  if (!firebaseConfigured()) {
    console.error("Firebase Admin is not configured");
    return null;
  }

  if (!token) {
    console.error("No Firebase ID token received");
    return null;
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    console.log(
      "Firebase token verified:",
      decodedToken.uid
    );

    return decodedToken;
  } catch (error) {
    console.error(
      "Firebase ID token verification failed:",
      error.message
    );

    return null;
  }
}