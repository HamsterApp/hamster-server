const errors = require("restify-errors");
const Category = require("../schemas/Category");
const Item = require("../schemas/Item");
const jwt = require("../util/jwt");

const makeCategoryObject = (doc) => {
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
};

module.exports = (server) => {
  // get all categories
  server.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await Category.find();

      res.send(categories.map((c) => makeCategoryObject(c)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create category
  server.post("/api/categories", async (req, res, next) => {
    req.accepts("application/json");

    let newCategory = new Category(req.body);
    newCategory.createdBy = jwt.getUserId(req);
    newCategory.updatedBy = jwt.getUserId(req);

    try {
      const insertedCategory = await newCategory.save();
      res.send(201, makeCategoryObject(insertedCategory));
      console.log("Created new category", makeCategoryObject(insertedCategory));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  // update category
  server.put("/api/categories/:id", async (req, res, next) => {
    req.accepts("application/json");

    const update = req.body;
    delete update._id;
    delete update.createdBy;
    delete update.createdAt;
    delete update.updatedAt;

    update.updatedBy = jwt.getUserId(req);

    try {
      const updatedCategory = await Category.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedCategory === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No category with id ${req.params.id}`
          )
        );
      }

      res.send(makeCategoryObject(updatedCategory));
      console.log("Updated category", makeCategoryObject(updatedCategory));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  server.del("/api/categories/:id", async (req, res, next) => {
    try {
      const deletedCategory = await Category.findOneAndRemove({
        _id: req.params.id,
      });

      if (deletedCategory === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(
            `No category with id ${req.params.id}`
          )
        );
      }

      // remove category from all foods
      await Item.updateMany(
        { category: req.params.id },
        { $set: { category: null, updatedBy: jwt.getUserId(req) } }
      );

      res.send(makeCategoryObject(deletedCategory));
      console.log("Deleted category", makeCategoryObject(deletedCategory));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
