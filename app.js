require("dotenv").config();
const options = require("./knexfile.js");
const knex = require("./knexfile.js");

var createError = require("http-errors");
var express = require("express");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');

const cors = require('cors');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var moviesRouter = require("./routes/movies");
var peopleRouter = require("./routes/people");

var app = express();

// Configures the Express view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Register middleware for logging, request parsing, static files and CORS
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Makes the Knex database connection available to all routes
app.use((req, res, next) => {
req.db = knex;
next();
});

// Register application routes
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/movies", moviesRouter);
app.use("/people", peopleRouter);

// Expose the Swagger API documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/knex", function (req, res, next) {
  req.db
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });

});

// Handle requests for routes that do not exist
app.use(function (req, res, next) {
  next(createError(404));
});

// Centralised error handler
app.use(function (err, req, res, next) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the following error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;