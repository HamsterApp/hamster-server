module.exports = {
  // environment: "development" or "production"
  ENV: process.env.NODE_ENV || "development",
  // port for the application to listen for requests
  PORT: process.env.PORT || 3000,
  // connection string for the MongoDB database to use
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/hamsterdb",
  // number of bcrypt rounds to use for password hashing
  BCRYPT_SALT_ROUNDS: 10,
  // secret to use for generating and verifying JWT
  JWT_SECRET: process.env.JWT_SECRET || "123456",
  // amount of time a JWT is valid
  JWT_EXPIRATION_SPAN: process.env.JWT_EXPIRATION_SPAN || "60m",
  // whether to add artificial delay to responses for testing: either false or delay in ms
  ARTIFICIAL_DELAY: process.env.ARTIFICIAL_DELAY || false,
};
