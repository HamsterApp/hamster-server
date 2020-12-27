const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
const logger = require("morgan");
const config = require("./config");
const restifyJwt = require("restify-jwt-community");
const mongoose = require("mongoose");
const { el } = require("date-fns/locale");

require("dotenv").config();

const server = restify.createServer({
  name: "hamster-api",
  version: "1.0.0",
});

// middlewares
server.use(logger("dev"));
server.use(restify.plugins.queryParser());
server.use(
  restify.plugins.bodyParser({
    mapParams: true,
    mapFiles: true,
    keepExtensions: true,
    uploadDir: "/tmp/",
  })
);
server.pre(restify.pre.sanitizePath());

// protect non GET routes using JWT
server.use((req, res, next) => {
  if (req.method !== "GET") {
    restifyJwt({ secret: config.JWT_SECRET }).unless({ path: ["/api/auth"] })(
      req,
      res,
      next
    );
  } else {
    // GET routes are public
    next();
  }
});

// cors
const cors = corsMiddleware({
  origins: ["*"],
});

server.pre(cors.preflight);
server.use(cors.actual);

// response delay for testing
if (config.ARTIFICIAL_DELAY) {
  server.use((req, res, next) => {
    setTimeout(() => {
      next();
    }, config.ARTIFICIAL_DELAY);
  });
}

// mongodb connection
server.listen(config.PORT, () => {
  mongoose
    .connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .catch((err) => {
      console.log("Could not connect to MongoDB", err);
    });
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  // setup routes
  require("./routes/meta")(server);
  require("./routes/history")(server);
  require("./routes/stock")(server);
  require("./routes/auth")(server);
  require("./routes/categories")(server);
  require("./routes/groups")(server);
  require("./routes/items")(server);
  require("./routes/locations")(server);
  require("./routes/tags")(server);
  require("./routes/units")(server);
  require("./routes/users")(server);
  console.log(`Server listening for API requests on port ${config.PORT}`);
});
