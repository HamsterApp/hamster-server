const jsonwebtoken = require("jsonwebtoken");

module.exports = {
  getUserId: function (req) {
    const jwt = req.header("Authorization").split(" ")[1];
    const decodedJwt = jsonwebtoken.decode(jwt);

    return decodedJwt.id;
  },
};
