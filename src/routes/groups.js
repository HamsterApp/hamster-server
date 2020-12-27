const errors = require("restify-errors");
const Group = require("../schemas/Group");
const Item = require("../schemas/Item");
const jwt = require("../util/jwt");
const { makeGroupObject } = require("../util/docToObj");

module.exports = (server) => {
  // get all groups
  server.get("/api/groups", async (req, res, next) => {
    try {
      const groups = await Group.find();
      res.send(groups.map((g) => makeGroupObject(g)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // get group by id
  server.get("/api/groups/:id", async (req, res, next) => {
    try {
      const g = await Group.findById(req.params.id);

      if (g === null) {
        return next(
          new errors.ResourceNotFoundError(`No group with id ${req.params.id}`)
        );
      }

      res.send(makeGroupObject(g));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create group
  server.post("/api/groups", async (req, res, next) => {
    req.accepts("application/json");

    const newGroup = new Group(req.body);
    newGroup.createdBy = jwt.getUserId(req);
    newGroup.updatedBy = jwt.getUserId(req);

    try {
      const insertedGroup = await newGroup.save();

      res.send(201, makeGroupObject(insertedGroup));
      console.log("Created new group", makeGroupObject(insertedGroup));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update group
  server.put("/api/groups/:id", async (req, res, next) => {
    req.accepts("application/json");

    const update = req.body;
    delete update._id;
    delete update.createdBy;
    delete update.createdAt;
    delete update.updatedAt;

    update.updatedBy = jwt.getUserId(req);

    try {
      const updatedGroup = await Group.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedGroup === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No group with id ${req.params.id}`)
        );
      }

      res.send(makeGroupObject(updatedGroup));
      console.log("Updated group", makeGroupObject(updatedGroup));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // delete group
  server.del("/api/groups/:id", async (req, res, next) => {
    try {
      const deletedGroup = await Group.findOneAndRemove({
        _id: req.params.id,
      });

      if (deletedGroup === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No group with id ${req.params.id}`)
        );
      }

      // remove default location from all foods
      await Item.updateMany(
        { group: req.params.id },
        { $set: { group: null, updatedBy: jwt.getUserId(req) } }
      );

      res.send(makeGroupObject(deletedGroup));
      console.log("Deleted group", makeGroupObject(deletedGroup));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
