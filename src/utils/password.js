const { createHash } = require("crypto");

function hashPassword(password) {
  return createHash("sha256").update(String(password)).digest("hex");
}

function verifyPassword(password, passwordHash) {
  return hashPassword(password) === passwordHash;
}

module.exports = { hashPassword, verifyPassword };
