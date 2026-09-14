const { getAuth } = require("../config/firebase");
const store = require("./firestoreService");

function firebasePhone(firebaseUser) {
  return firebaseUser.phone_number || firebaseUser.phoneNumber || "";
}

function firebaseName(firebaseUser) {
  return firebaseUser.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Parent";
}

async function findUserProfile(firebaseUser) {
  const byUid = await store.findOne("users", [["firebaseUid", "==", firebaseUser.uid]]);
  if (byUid) return byUid;

  if (firebaseUser.email) {
    const byEmail = await store.findOne("users", [["email", "==", firebaseUser.email]]);
    if (byEmail) {
      return store.updateDoc("users", byEmail.id, { firebaseUid: firebaseUser.uid });
    }
  }

  return null;
}

async function ensureUserProfile(firebaseUser, defaults = {}) {
  const existing = await findUserProfile(firebaseUser);
  if (existing) return existing;

  const role = defaults.role || "PARENT";
  const user = await store.createDoc("users", {
    firebaseUid: firebaseUser.uid,
    name: defaults.name || firebaseName(firebaseUser),
    email: defaults.email || firebaseUser.email || "",
    phone: defaults.phone || firebasePhone(firebaseUser),
    role,
  }, store.makeId("USR"));

  if (role === "PARENT") {
    await store.createDoc("parents", { userId: user.id, firebaseUid: firebaseUser.uid }, store.makeId("PAR"));
  }

  if (role === "TUTOR") {
    await store.createDoc("tutors", { userId: user.id, firebaseUid: firebaseUser.uid, classes: defaults.classes || [] }, store.makeId("TUT"));
  }

  if (role === "ADMIN") {
    await store.createDoc("admins", { userId: user.id, firebaseUid: firebaseUser.uid }, store.makeId("ADM"));
  }

  return user;
}

async function ensureProfileFromUid(uid, defaults = {}) {
  const firebaseUser = await getAuth().getUser(uid);
  return ensureUserProfile(firebaseUser, defaults);
}

module.exports = { findUserProfile, ensureUserProfile, ensureProfileFromUid };
