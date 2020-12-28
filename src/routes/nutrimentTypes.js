const errors = require("restify-errors");
const NutrimentType = require("../schemas/NutrimentType");

module.exports = (server) => {
  // get all nutriment types
  server.get("/api/nutriments", async (req, res, next) => {
    try {
      const types = await NutrimentType.find();
      res.send(
        types.map((t) => ({
          key: t.key,
          name: t.name,
          unit: t.unit,
        }))
      );
      next();
    } catch (error) {
      next(new errors.InternalServerError(error));
    }
  });
};
