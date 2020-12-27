const errors = require("restify-errors");
const StockEntry = require("../schemas/StockEntry");
const HistoryEntry = require("../schemas/HistoryEntry");
const Item = require("../schemas/Item");
const Group = require("../schemas/Group");
const Category = require("../schemas/Category");
const StorageLocation = require("../schemas/StorageLocation");
const config = require("../config");
const packageJson = require("../../package.json");
const startOfDay = require("date-fns/startOfDay"); 
const addDays = require("date-fns/addDays");
const objs = require("../util/docToObj");

const fetchMetadata = (almostExpiredSpan) => {
  const now = startOfDay(Date.now());
  const data = {
    apiVersion: packageJson.version,
    almostExpiredSpan: almostExpiredSpan,
  };

  // total number of items
  data.totalItems = await Item.countDocuments();

  // total number of (non-consumed) stock entries
  data.totalStock = await StockEntry.countDocuments({consumed: false});

  // list of expired stock entries
  data.expiredStock = await StockEntry.find({bestBefore: {$lte: now}}).map(e => objs.makeStockObject(e));

  // list of almost expired stock entries
  data.amostExpiredStock = await StockEntry.find({bestBefore: {$lte: addDays(now, almostExpiredSpan)}}).map(e => e.makeStockObject(e));

  // list of items below target stock

  // TODO: maybe more efficient implementation for large number of items in db
  data.belowStockItems = [];
  const allItems = await Item.find({targetStock: {$gte: 1}});
  allItems.forEach(i => {
    const totalStock = await StockEntry.countDocuments({$and: [{item: i._id}, {consumed: false}]});
    if (totalStock < i.targetStock) {
      data.belowStockItems.push(objs.makeItemObject(i));
    }
  });

  // list of groups below target stock

  // TODO: maybe more efficient implementation for large number of groups in db
  data.belowStockGroups = [];
  const allGroups = await Group.find({targetStock: {$gte: 1}});
  allGroups.forEach(g => {
    const itemsInGroup = await Item.find({group: g._id});
    let groupStock = 0;
    itemsInGroup.forEach(i => {
      groupStock += await StockEntry.countDocuments({$and: [{item: i._id}, {consumed: false}]});
    });

    if (groupStock < g.targetStock) {
      data.belowStockGroups.push(objs.makeGroupObject(g));
    }
  });


  // 10 most recent history entries
  data.latestActions = await HistoryEntry.find().sort({date: -1}).limit(10).map(h => objs.makeHistoryObject(h));

  // 5 most recently changed / added items
  data.recentItemChanges = await Item.find().sort({updatedAt: -1}).limit(5).map(i => objs.makeItemObject(i));

  // 5 mos recently changed / added groups
  data.recentGroupChanges = await Group.find().sort({updatedAt: -1}).limit(5).map(g => objs.makeGroupObject(g));

  // 5 most recently changed / added categories
  data.recentCategoryChanges = await Category.find().sort({updatedAt: -1}).limit(5).map(c => objs.makeCategoryObject(c));

  // 5 most recently changed / added locations
  data.recentLocationChanged = await StorageLocation.find().sort({updatedAt: -1}).limit(5).map(l => objs.makeLocationObject(l));

  return data;
};

module.exports = (server) => {
  server.get("/api/meta", async (req, res, next) => {
    const almostExpiredSpan =
      req.query.almostExpired || config.DEFAUL_ALMOST_EXPIRED_SPAN;

    try {
      const data = fetchMetadata(almostExpiredSpan);
      res.send(data);
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });
};
