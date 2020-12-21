const errors = require("restify-errors");
const jwt = require("jsonwebtoken");
const config = require("../config");
const bcrypt = require("bcrypt");
const User = require("../schemas/User");

function checkUser(username, password) {
  return new Promise(async (resolve, reject) => {
    try {
      // get user by username
      const userByName = await User.findOne({ username: username });

      // check matching password
      bcrypt.compare(password, userByName.password, (err, isMatch) => {
        if (err) {
          // something went wrong while trying to compare the passwords
          console.log(`Error while comparing passwords: ${err}`);
          reject("Authentication failed");
        }

        if (isMatch) {
          // auth success
          resolve(userByName);
        } else {
          // passwords do not match
          reject("Authentication failed");
        }
      });
    } catch (e) {
      // no user exists with given username
      reject("Authentication failed");
    }
  });
}

module.exports = (server) => {
  // auth user by username and password
  server.post("/api/auth", async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await checkUser(username, password);

      const payload = {
        id: user._id,
        username: user.username,
        display_name: user.display_name,
      };

      // create new JWT
      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRATION_SPAN,
      });
      const { iat, exp } = jwt.decode(token);

      // respond with JWT
      res.send({ iat, exp, token });
      next();
    } catch (e) {
      // auth failed
      return next(new errors.UnauthorizedError(e));
    }
  });
};
