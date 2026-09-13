const { getFirestore } = require("../config/firebase");
const { collections } = require("../config/firebaseCollections");
const { randomUUID } = require("crypto");

function withId(snapshot) {
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

function collection(name) {
  return getFirestore().collection(collections[name] || name);
}

function clean(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function makeId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

async function createDoc(name, data, id) {
  const ref = id ? collection(name).doc(id) : collection(name).doc();
  await ref.set(clean({ id: ref.id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  const saved = await ref.get();
  return withId(saved);
}

async function getDoc(name, id) {
  return withId(await collection(name).doc(id).get());
}

async function updateDoc(name, id, data) {
  const ref = collection(name).doc(id);
  await ref.set(clean({ ...data, updatedAt: new Date().toISOString() }), { merge: true });
  return withId(await ref.get());
}

async function deleteDoc(name, id) {
  const doc = await getDoc(name, id);
  if (doc) await collection(name).doc(id).delete();
  return doc;
}

async function listDocs(name, filters = []) {
  let query = collection(name);
  filters.forEach(([field, op, value]) => {
    query = query.where(field, op, value);
  });
  const snapshot = await query.get();
  return snapshot.docs.map(withId);
}

async function findOne(name, filters = []) {
  let query = collection(name);
  filters.forEach(([field, op, value]) => {
    query = query.where(field, op, value);
  });
  const snapshot = await query.limit(1).get();
  return snapshot.empty ? null : withId(snapshot.docs[0]);
}

module.exports = { collection, makeId, createDoc, getDoc, updateDoc, deleteDoc, listDocs, findOne };
