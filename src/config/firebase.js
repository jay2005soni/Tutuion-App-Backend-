const { applicationDefault, cert, getApp, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth: firebaseGetAuth } = require("firebase-admin/auth");
const { getFirestore: firebaseGetFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const { env } = require("./env");

function initializeFirebase() {
  if (getApps().length) return getApp();

  const options = {};

  if (env.firebaseServiceAccountPath) {
    const serviceAccountPath = path.resolve(process.cwd(), env.firebaseServiceAccountPath);
    const serviceAccount = require(serviceAccountPath);
    options.credential = cert(serviceAccount);
  } else {
    options.credential = applicationDefault();
  }

  if (env.firebaseStorageBucket) {
    options.storageBucket = env.firebaseStorageBucket;
  }

  return initializeApp(options);
}

function getFirebaseAdmin() {
  return initializeFirebase();
}

function getFirestore() {
  return firebaseGetFirestore(getFirebaseAdmin());
}

function getAuth() {
  return firebaseGetAuth(getFirebaseAdmin());
}

function getStorageBucket() {
  return getStorage(getFirebaseAdmin()).bucket();
}

module.exports = { initializeFirebase, getFirebaseAdmin, getFirestore, getAuth, getStorageBucket };
