const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");
const store = require("../services/firestoreService");

async function createNote(req, res, next) {
  try {
  const note = await store.createDoc("notes", req.body, store.makeId("NOTE"));
  return created(res, "Note created successfully", note);
  } catch (error) {
    next(error);
  }
}

async function getStudentNotes(req, res, next) {
  try {
    const student = await requireStudentAccess(req.user, req.params.studentId);
    const filters = [["class", "==", student.class]];
    if (req.query.subject) filters.push(["subject", "==", req.query.subject]);
    const notes = await store.listDocs("notes", filters);
    return ok(res, "Notes fetched successfully", { notes });
  } catch (error) {
    next(error);
  }
}

async function noteDetail(req, res, next) {
  try {
    const note = await store.getDoc("notes", req.params.noteId);
    if (!note) throw fail(404, "Note not found", "NOTE_NOT_FOUND");
    return ok(res, "Note fetched successfully", note);
  } catch (error) {
    next(error);
  }
}

async function deleteNote(req, res, next) {
  try {
    const note = await store.getDoc("notes", req.params.noteId);
    if (!note) throw fail(404, "Note not found", "NOTE_NOT_FOUND");
    await store.deleteDoc("notes", note.id);
    return ok(res, "Note deleted successfully", note);
  } catch (error) {
    next(error);
  }
}

module.exports = { createNote, getStudentNotes, noteDetail, deleteNote };
