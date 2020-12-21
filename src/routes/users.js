const errors = require("restify-errors");
const User = require("../schemas/User");

module.exports = (server) => {
  // get all users
  server.get("/api/users", async (req, res, next) => {
    try {
      const users = await User.find();

      res.send(
        users.map((u) => ({
          id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
        }))
      );

      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });

  // get user by id or username
  server.get("/api/users/:id", async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (user === null) {
        // no user with given identifier
        next(
          new errors.NotFoundError(
            `No user is identified with id ${req.params.identifier}`
          )
        );
      } else {
        const response = {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        };

        //TODO: if authenticated user is requested user: add preferences and email fields

        res.send(response);
        next();
      }
    } catch (error) {}
  });

  server.put("/api/users/:id", async (req, res, next) => {
    try {
      // TODO: check for matching jwt user and and requested id

      let update = req.body;

      // delete read-only properties if present
      delete update._id;

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedUser === null) {
        // id not found
        return next(
          new errors.NotFoundError(`No user with id ${req.params.id}`)
        );
      }

      // respond with updated user
      res.send({
        id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences || {},
      });
      console.log(`updated user ${updatedUser.username}`);
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });
};
