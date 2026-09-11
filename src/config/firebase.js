const admin = require("firebase-admin");
const path = require("path");
const { env } = require("./env");

function initializeFirebase() {
  if (admin.apps.length) return admin.app();

  const options = {};

  if (env.firebaseServiceAccountPath) {
    const serviceAccountPath = path.resolve(process.cwd(), env.firebaseServiceAccountPath);
    const serviceAccount = require(serviceAccountPath);
    options.credential = admin.credential.cert(serviceAccount);
  } else {
    options.credential = admin.credential.applicationDefault();
  }

  if (env.firebaseStorageBucket) {
    options.storageBucket = env.firebaseStorageBucket;
  }

  return admin.initializeApp(options);
}

function getFirebaseAdmin() {
  initializeFirebase();
  return admin;
}

function getFirestore() {
  return getFirebaseAdmin().firestore();
}

function getAuth() {
  return getFirebaseAdmin().auth();
}

function getStorageBucket() {
  return getFirebaseAdmin().storage().bucket();
}

module.exports = { initializeFirebase, getFirebaseAdmin, getFirestore, getAuth, getStorageBucket };
