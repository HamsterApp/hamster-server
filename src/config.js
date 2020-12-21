module.exports = {
  ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/hamsterdb",
  BCRYPT_SALT_ROUNDS: 10,
  JWT_SECRET: process.env.JWT_SECRET || "123456",
  JWT_EXPIRATION_SPAN: process.env.JWT_EXPIRATION_SPAN || "10m",
  USE_AUTHENTICATION: process.env.USE_AUTHENTICATION || true,
};
