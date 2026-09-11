const { getFirestore } = require("../config/firebase");
const { collections } = require("../config/firebaseCollections");

function withId(snapshot) {
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

function collection(name) {
  return getFirestore().collection(collections[name] || name);
}

async function createDoc(name, data, id) {
  const ref = id ? collection(name).doc(id) : collection(name).doc();
  await ref.set({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  const saved = await ref.get();
  return withId(saved);
}

async function getDoc(name, id) {
  return withId(await collection(name).doc(id).get());
}

async function updateDoc(name, id, data) {
  const ref = collection(name).doc(id);
  await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
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

module.exports = { collection, createDoc, getDoc, updateDoc, deleteDoc, listDocs };
