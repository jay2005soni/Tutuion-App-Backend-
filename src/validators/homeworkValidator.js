function validateCreateHomework(body) {
  return Boolean(body.studentId && body.subject && body.title && body.assignedDate && body.dueDate);
}

module.exports = { validateCreateHomework };
