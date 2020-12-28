const StockEntry = require("../schemas/StockEntry");

module.exports = {
  makeCategoryObject: (doc) => {
    return {
      id: doc._id,
      name: doc._name,
      description: doc.description,
      parent: doc.parent || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy || null,
      updatedBy: doc.updatedBy || null,
    };
  },

  makeGroupObject: (doc) => {
    return {
      id: doc._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy || null,
      updatedBy: doc.updatedBy || null,
      name: doc.name,
      description: doc.description,
      category: doc.category || null,
      defaultLocation: doc.defaultLocation || null,
    };
  },

  makeHistoryObject: (doc) => {
    return {
      id: doc._id,
      type: doc.type,
      entry: doc.entry,
      item: doc.item,
      user: doc.user || null,
    };
  },

  makeItemObject: async (doc, queryEntries = true) => {
    let numStockEntries = 0;

    if (queryEntries) {
      // query number of (non consumed) stock entries for this item
      try {
        numStockEntries = await StockEntry.countDocuments({
          $and: [{ item: doc._id }, { consumed: false }],
        });
      } catch (error) {
        console.log(
          `Error while counting stock entries for item ${doc._id}`,
          error
        );
        numStockEntries = 0;
      }
    }

    return {
      id: doc._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy || null,
      updatedBy: doc.updatedBy || null,
      name: doc.name,
      description: doc.description,
      ean: doc.ean || null,
      category: doc.category || null,
      nutriments: doc.nutriments || [],
      unit: doc.unit || null,
      conversions: doc.conversions || null,
      defaultLocation: doc.defaultLocation || null,
      tags: doc.tags || [],
      targetStock: doc.targetStock,
      slug: doc.slug,
      thumbnail: doc.thumbnail || null,
      images: doc.images || null,
      group: doc.group || null,
      stock: numStockEntries,
    };
  },
  makeLocationObject: (doc) => {
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
  },

  makeStockObject: (doc) => {
    return {
      id: doc._id,
      item: doc.item,
      bestBefore: doc.item || null,
      opened: doc.opened,
      consumed: doc.consumed,
      location: doc.location || null,
      price: doc.price || null,
      store: doc.store || null,
    };
  },

  makeTagObject: (doc) => {
    return {
      id: doc._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy || null,
      updatedBy: doc.updatedBy || null,
      label: doc.label,
      description: doc.description,
      color: doc.color,
    };
  },
  makeUnitObject: (doc) => {
    return {
      id: doc._id,
      name: doc.name,
      symbol: doc.symbol,
    };
  },
  makeUserObject: (doc) => {
    return {
      id: doc._id,
      username: doc.username,
      displayName: doc.displayName,
      email: doc.email || null,
      avatar: doc.avatar || null,
      preferences: doc.preferences || {},
    };
  },
};
