const {
  getApp,
  getApps,
  initializeApp,
  cert,
} = require("firebase-admin/app");

const {
  getAuth: firebaseGetAuth,
} = require("firebase-admin/auth");

const {
  getFirestore: firebaseGetFirestore,
} = require("firebase-admin/firestore");

const {
  getStorage,
} = require("firebase-admin/storage");

const { env } = require("./env");

function initializeFirebase() {
  if (getApps().length) {
    return getApp();
  }

  if (
    !env.firebaseProjectId ||
    !env.firebaseClientEmail ||
    !env.firebasePrivateKey
  ) {
    throw new Error(
      "Firebase Admin credentials are missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey,
    }),
    storageBucket: env.firebaseStorageBucket || undefined,
  });
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

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getFirestore,
  getAuth,
  getStorageBucket,
};