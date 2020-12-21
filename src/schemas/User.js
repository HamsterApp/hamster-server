const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../config");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address",
    ],
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
});

// replace plaintext password with hash in user before it is stored in database
UserSchema.pre("save", function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  // generate salt
  bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS, (saltErr, salt) => {
    if (saltErr) return next(saltErr);

    // hash passwords
    bcrypt.hash(this.password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      this.password = hash;
      next();
    });
  });
});

UserSchema.pre("findOneAndUpdate", function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.getUpdate().hasOwnProperty("password")) return next();

  // generate salt
  bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS, (saltErr, salt) => {
    if (saltErr) return next(saltErr);

    // hash passwords
    bcrypt.hash(this.getUpdate().password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      this.getUpdate().password = hash;
      next();
    });
  });
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
