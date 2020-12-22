const errors = require("restify-errors");
const { update } = require("../schemas/Tag");
const Tag = require("../schemas/Tag");
const jwt = require("../util/jwt");

const makeTagObject = (doc) => {
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
};

module.exports = (server) => {
  // get all tags
  server.get("/api/tags", async (req, res, next) => {
    try {
      const tags = await Tag.find();
      res.send(tags.map((t) => makeTagObject(t)));
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });

  // create new tag
  server.post("/api/tags", async (req, res, next) => {
    req.accepts("application/json");

    const newTag = new Tag(req.body);
    newTag.createdBy = jwt.getUserId(req);
    newTag.updatedBy = jwt.getUserId(req);

    try {
      const insertedTag = await newTag.save();
      res.send(201, makeTagObject(insertedTag));
      console.log("Created new tag", makeTagObject(insertedTag));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  server.put("/api/tags/:id", async (req, res, next) => {
    req.accepts("application/json");

    let udpate = req.body;
    // delete read-only fields if passed
    delete update._id;
    delete update.createdBy;
    delete update.createdAt;
    delete update.updatedAt;

    //update updatedBy field by user id in jwt
    update.updatedBy = jwt.getUserId(req);

    try {
      const updatedTag = await Tag.findOneAndUpdate(
        { _id: req.params.id },
        update,
        { new: true }
      );

      if (updatedTag === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No tag with id ${req.params.id}`)
        );
      }

      res.send(makeTagObject(updatedTag));
      console.log("Updated tag", makeTagObject(updatedTag));
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(new errors.BadRequestError(error));
      }
      return next(new errors.InternalServerError(error));
    }
  });

  server.del("/api/tag/:id", async (req, res, next) => {
    try {
      // TODO: check if tag is used by any food

      const deletedTag = await Tag.findOneAndRemove({ _id: req.params.id });

      if (deletedTag === null) {
        // id not found
        return next(
          new errors.ResourceNotFoundError(`No tag with id ${req.params.id}`)
        );
      }

      res.send(makeTagObject(deletedTag));
      console.log("Deleted tag", makeTagObject(deletedTag));
      next();
    } catch (error) {
      return next(new errors.InternalServerError(error));
    }
  });
};
