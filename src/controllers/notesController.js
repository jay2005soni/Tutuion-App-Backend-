const { db, id } = require("../config/database");
const { created, fail, ok } = require("../utils/http");
const { requireStudentAccess } = require("../services/permissionService");

function createNote(req, res) {
  const note = { id: id("NOTE"), ...req.body };
  db.notes.push(note);
  return created(res, "Note created successfully", note);
}

function getStudentNotes(req, res, next) {
  try {
    const student = requireStudentAccess(req.user, req.params.studentId);
    const notes = db.notes.filter((item) => item.class === student.class && (!req.query.subject || item.subject === req.query.subject));
    return ok(res, "Notes fetched successfully", { notes });
  } catch (error) {
    next(error);
  }
}

function noteDetail(req, res, next) {
  try {
    const note = db.notes.find((item) => item.id === req.params.noteId);
    if (!note) throw fail(404, "Note not found", "NOTE_NOT_FOUND");
    return ok(res, "Note fetched successfully", note);
  } catch (error) {
    next(error);
  }
}

function deleteNote(req, res, next) {
  try {
    const index = db.notes.findIndex((item) => item.id === req.params.noteId);
    if (index === -1) throw fail(404, "Note not found", "NOTE_NOT_FOUND");
    const [note] = db.notes.splice(index, 1);
    return ok(res, "Note deleted successfully", note);
  } catch (error) {
    next(error);
  }
}

module.exports = { createNote, getStudentNotes, noteDetail, deleteNote };
