const errors = require("restify-errors");
const StorageLocation = require("../schemas/StorageLocation");
const Item = require("../schemas/Item");
const jwt = require("../util/jwt");

const makeLocationObject = (doc) => {
  return {
    id: doc._id,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy || null,
    updatedBy: doc.updatedBy || null,
    name: doc.name,
    info: doc.info || {},
    parent: doc.parent || null,
  };
};

module.exports = (server) => {
  // get all locations
  server.get("/api/locations", async (req, res, next) => {
    try {
      const locations = await StorageLocation.find();

      res.send(locations.map((l) => makeLocationObject(l)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create new location
  server.post("/api/locations", async (req, res, next) => {
    req.accepts("application/json");

    const newLocation = new StorageLocation(req.body);
    newLocation.createdBy = jwt.getUserId(req);
    newLocation.updatedBy = jwt.getUserId(req);

    try {
      const insertedLocation = await newLocation.save();

      res.send(201, makeLocationObject(insertedLocation));
      console.log("Created new location", makeLocationObject(insertedLocation));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update location
  server.put("/api/location/:id", async (req, res, next) => {
    req.accepts("application/json");

    const update = req.body;
    delete update._id;
    delete update.createdBy;
    delete update.createdAt;
    delete update.updatedAt;

    update.updatedBy = jwt.getUserId(req);

    try {
      const updatedLocation = await StorageLocation.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedLocation === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No location with id ${req.params.id}`
          )
        );
      }

      res.send(makeLocationObject(updatedLocation));
      console.log("Updated location", makeLocationObject(updatedLocation));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // delete location
  server.del("/api/locations/:id", async (req, res, next) => {
    try {
      const deletedLocation = StorageLocation.findOneAndRemove({
        _id: req.params.id,
      });

      if (deletedLocation === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No location with id ${req.params.id}`
          )
        );
      }

      // remove location from all foods
      Item.updateMany(
        { location: req.params.id },
        { $set: { location: null, updatedBy: jwt.getUserId(req) } }
      );

      res.send(makeLocationObject(deletedLocation));
      console.log("Deleted location", makeLocationObject(deletedLocation));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
