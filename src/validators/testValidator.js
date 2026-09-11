function validateCreateTest(body) {
  return Boolean(body.title && body.subject && body.class && body.date && body.totalMarks);
}

module.exports = { validateCreateTest };
