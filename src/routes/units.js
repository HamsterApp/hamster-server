const errors = require("restify-errors");
const Unit = require("../schemas/Unit");
const Item = require("../schemas/Item");
const jwt = require("../util/jwt");

const makeUnitObject = (doc) => {
  return {
    id: doc._id,
    name: doc.name,
    symbol: doc.symbol,
  };
};

module.exports = (server) => {
  // get all units
  server.get("/api/units", async (req, res, next) => {
    try {
      const units = await Unit.find();
      res.send(units.map((u) => makeUnitObject(u)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create unit
  server.post("/api/units", async (req, res, next) => {
    req.accepts("application/json");

    const newUnit = new Unit(req.body);

    try {
      const insertedUnit = await newUnit.save();

      res.send(201, makeUnitObject(insertedUnit));
      console.log("Created unit", makeUnitObject(insertedUnit));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update unit
  server.put("/api/units/:id", async (req, res, next) => {
    req.accepts("application/json");

    const update = req.body;
    delete update.id;

    try {
      const updatedUnit = await Unit.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedUnit === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No unit with id ${req.params.id}`)
        );
      }

      res.send(makeUnitObject(updatedUnit));
      console.log("Updated unit", makeUnitObject(updatedUnit));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // delete unit
  server.del("/api/units/:id", async (req, res, next) => {
    try {
      const deletedUnit = Unit.findOneAndRemove({ _id: req.params.id });

      if (deletedUnit === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No unit with id ${req.params.id}`)
        );
      }

      // remove unit from all foods
      await Item.updateMany(
        { unit: req.params.id },
        { $set: { unit: null, updatedBy: jwt.getUserId(req) } }
      );

      res.send(makeUnitObject(deletedUnit));
      console.log("Deleted unit", makeUnitObject(deletedUnit));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
