const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "dev_only_change_me",
  tokenExpiresInSeconds: Number(process.env.TOKEN_EXPIRES_IN_SECONDS || 86400),
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5000",
};

module.exports = { env };
