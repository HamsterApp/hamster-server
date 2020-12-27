const errors = require("restify-errors");
const StockEntry = require("../schemas/StockEntry");
const HistoryEntry = require("../schemas/HistoryEntry");
const jwt = require("../util/jwt");
const { makeStockObject } = require("../util/docToObj");

module.exports = (server) => {
  // get stock entrief for specific item by item id
  server.get("/api/items/:id/stock", async (req, res, next) => {
    // parse query parameters to only fetch non-consumed entries
    let filter = { item: req.params.id };
    if (req.query.consumed === false) {
      // only non-consumed entries requested
      filter = { $and: [{ item: req.params.id }, { consumed: false }] };
    }

    try {
      const entries = await StockEntry.find(filter);
      res.send(entries.map((e) => makeStockObject(e)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // add a new stock entry for an item
  server.post("/api/items/:id/stock", async (req, res, next) => {
    const entry = new StockEntry(req.body);
    delete entry.id;
    entry.item = req.params.id;

    // TODO: delete time from bestBefore field (set h,m,s,ms to 0)

    try {
      const insertedEntry = await entry.save();
      console.log("Created stock entry", makeStockObject(insertedEntry));

      // create "added" history entry for this item
      const history = await new HistoryEntry({
        type: "added",
        entry: insertedEntry._id,
        item: insertedEntry.item,
        user: jwt.getUserId(req),
      }).save();

      console.log(
        `Created history entry for stock entry ${insertedEntry._id}`,
        history
      );

      res.send(201, makeStockObject(insertedEntry));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update a stock entry by its id
  server.put("/api/stock/:id", async (req, res, next) => {
    const update = req.body;
    delete update.id;

    // TODO: delete time from bestBefore field (set h,m,s,ms to 0)

    try {
      // get entry before update
      const oldEntry = await StockEntry.findById(req.params.id);

      // get entry after update
      const updatedEntry = await StockEntry.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedEntry === null || oldEntry === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No stock entry with id ${req.params.id}`
          )
        );
      }

      console.log("Updated stock entry", makeStockObject(updatedEntry));

      // update history if necessary

      // check if opened field has been changed in udpate
      if (oldEntry.opened != updatedEntry.opened) {
        if (!oldEntry.opened && updatedEntry.opened) {
          // change from opened=false to opened=true: add history entry
          const history = await new HistoryEntry({
            type: "opened",
            entry: req.params.id,
            item: updatedEntry.item,
            user: jwt.getUserId(req),
          }).save();

          console.log(
            `Created opened history entry for stock entry ${req.params.id}`,
            history
          );
        } else {
          // change from opened=true to opened=false: delete opened history entry
          await HistoryEntry.findOneAndRemove({
            $and: [{ entry: req.params.id }, { type: "opened" }],
          });

          console.log(
            `Deleted opened history entry for stock entry ${req.params.id}`
          );
        }
      }

      // check if consumed field has been changed in udpate
      if (oldEntry.consumed != updatedEntry.consumed) {
        if (!oldEntry.consumed && updatedEntry.consumed) {
          // change from consumed=false to consumed=true: add history entry
          const history = await new HistoryEntry({
            type: "consumed",
            entry: req.params.id,
            item: updatedEntry.item,
            user: jwt.getUserId(req),
          }).save();

          console.log(
            `Created consumed history entry for stock entry ${req.params.id}`,
            history
          );
        } else {
          // change from consumed=true to consumed=false: delete consumed history entry
          await HistoryEntry.findOneAndRemove({
            $and: [{ entry: req.params.id }, { type: "consumed" }],
          });

          console.log(
            `Deleted consumed history entry for stock entry ${req.params.id}`
          );
        }
      }

      res.send(makeStockObject(updatedEntry));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // delete stock entry by id
  server.del("/api/stock/:id", async (req, res, next) => {
    try {
      const deletedEntry = await StockEntry.findOneAndRemove({
        _id: req.params.id,
      });

      if (deletedEntry === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No stock entry with id ${req.params.id}`
          )
        );
      }

      // delete all history entries associated with this stock entry
      await HistoryEntry.deleteMany({ entry: req.params.id });

      res.send(makeStockObject(deletedEntry));
      console.log(
        "Deleted stock entry and history",
        makeStockObject(deletedEntry)
      );
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
