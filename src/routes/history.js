const errors = require("restify-errors");
const HistoryEntry = require("../schemas/HistoryEntry");
const { makeHistoryObject } = require("../util/docToObj");

module.exports = (server) => {
  // get all history entries for specific item by item id
  server.get("/api/items/:id/history", async (req, res, next) => {
    try {
      const entries = await HistoryEntry.find({ item: req.params.id });
      res.send(entries.map((e) => makeHistoryObject(e)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // get all history entries for specific stock entry by stock entry id
  server.get("/api/stock/:id/history", async (req, res, next) => {
    try {
      const entries = await HistoryEntry.find({ entry: req.params.id });
      res.send(entries.map((e) => makeHistoryObject(e)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });
};
