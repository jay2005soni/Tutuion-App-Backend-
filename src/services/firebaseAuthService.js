const { getAuth } = require("../config/firebase");
const { env } = require("../config/env");
const { fail } = require("../utils/http");

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

async function signInWithEmailPassword(email, password) {
  if (!env.firebaseWebApiKey) {
    throw fail(500, "FIREBASE_WEB_API_KEY is required for email/password login", "FIREBASE_WEB_API_KEY_MISSING");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebaseWebApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw fail(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return data;
}

module.exports = { firebaseConfigured, verifyFirebaseIdToken, signInWithEmailPassword };
