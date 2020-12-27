const errors = require("restify-errors");
const Item = require("../schemas/Item");
const StockEntry = require("../schemas/StockEntry");
const HistoryEntry = require("../schemas/HistoryEntry");
const jwt = require("../util/jwt");
const { makeItemObject } = require("../util/docToObj");

module.exports = (server) => {
  // get all items
  server.get("/api/items", async (req, res, next) => {
    try {
      const items = await Item.find();
      res.send(items.map((i) => makeItemObject(i)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // get item by slug
  server.get("/api/items/:slug", async (req, res, next) => {
    try {
      const item = await Item.findOne({ slug: req.params.slug });

      if (item === null) {
        // not found
        return next(
          new errors.ResourceNotFoundError(
            `No item identified by slug ${req.params.slug}`
          )
        );
      }

      res.send(makeItemObject(item));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create new item
  server.post("/api/items", async (req, res, next) => {
    req.accepts("application/json");

    const newItem = new Item(req.body);
    newItem.createdBy = jwt.getUserId(req);
    newItem.updatedBy = jwt.getUserId(req);

    try {
      const insertedItem = await newItem.save();

      res.send(201, makeItemObject(insertedItem, false));
      console.log("Created item", makeItemObject(insertedItem, false));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update item
  server.put("/api/items/:id", async (req, res, next) => {
    req.accepts("application/json");

    const update = req.body;
    delete update._id;
    delete update.createdBy;
    delete update.createdAt;
    delete update.updatedAt;

    update.updatedBy = jwt.getUserId(req);

    try {
      const updatedItem = await Item.findOneAndUpdate(
        { _id: req.param.id },
        update,
        { new: true }
      );

      if (updatedItem === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No item with id ${req.params.id}`)
        );
      }

      res.send(makeItemObject(updatedItem));
      console.log("Updated item", makeItemObject(updatedItem));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // delete item
  server.del("/api/items/:id", async (req, res, next) => {
    try {
      const deletedItem = await Item.findOneAndRemove({ _id: req.params.id });

      if (deletedItem === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No item with id ${req.params.id}`)
        );
      }

      // delete all entries and history
      await StockEntry.deleteMany({ item: req.params.id });
      await HistoryEntry.deleteMany({ item: req.params.id });

      res.send(makeItemObject(deletedItem, false));
      console.log("Deleted item", makeItemObject(deletedItem, false));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
