const { createHmac, timingSafeEqual } = require("crypto");
const { env } = require("../config/env");

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(input) {
  return createHmac("sha256", env.jwtSecret).update(input).digest("base64url");
}

function createToken(payload) {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const body = base64url({ ...payload, iat: now, exp: now + env.tokenExpiresInSeconds });
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

function verifyToken(token) {
  const [header, body, signature] = String(token || "").split(".");
  if (!header || !body || !signature) return null;

  const expected = sign(`${header}.${body}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

module.exports = { createToken, verifyToken };
