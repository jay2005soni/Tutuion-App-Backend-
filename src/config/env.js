const env = {
  port: Number(process.env.PORT || 5000),

  jwtSecret: process.env.JWT_SECRET || "dev_only_change_me",

  tokenExpiresInSeconds: Number(
    process.env.TOKEN_EXPIRES_IN_SECONDS || 86400
  ),

  appBaseUrl:
    process.env.APP_BASE_URL || "http://localhost:5000",

  firebaseProjectId:
    process.env.FIREBASE_PROJECT_ID || "",

  firebaseClientEmail:
    process.env.FIREBASE_CLIENT_EMAIL || "",

  firebasePrivateKey:
    process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : "",

  firebaseStorageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "",

  firebaseWebApiKey:
    process.env.FIREBASE_WEB_API_KEY || "",
};

module.exports = { env };