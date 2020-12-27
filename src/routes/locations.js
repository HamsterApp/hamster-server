const errors = require("restify-errors");
const StorageLocation = require("../schemas/StorageLocation");
const Item = require("../schemas/Item");
const Group = require("../schemas/Group");
const StockEntry = require("../schemas/StockEntry");
const jwt = require("../util/jwt");
const { makeLocationObject } = require("../util/docToObj");

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
      const deletedLocation = await StorageLocation.findOneAndRemove({
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

      // remove default location from all foods
      await Item.updateMany(
        { defaultLocation: req.params.id },
        { $set: { defaultLocation: null, updatedBy: jwt.getUserId(req) } }
      );
      // remove default location from all foods
      await Group.updateMany(
        { defaultLocation: req.params.id },
        { $set: { defaultLocation: null, updatedBy: jwt.getUserId(req) } }
      );
      // remove location from all stock entries
      await StockEntry.updateMany(
        { location: req.params.id },
        { $set: { defaultLocation: null } }
      );
      // update children
      await StorageLocation.updateMany(
        { parent: req.params.id },
        { $set: { parent: null } }
      );

      res.send(makeLocationObject(deletedLocation));
      console.log("Deleted location", makeLocationObject(deletedLocation));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
