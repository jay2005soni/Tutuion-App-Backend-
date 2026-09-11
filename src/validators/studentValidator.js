function validateCreateStudent(body) {
  return Boolean(body.name && body.parentId);
}

module.exports = { validateCreateStudent };
