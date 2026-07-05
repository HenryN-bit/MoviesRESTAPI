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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());



// Database function
app.use((req, res, next) => {
req.db = knex;
next();
});

app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/movies", moviesRouter);
app.use("/people", peopleRouter);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/knex", function (req, res, next) {
  req.db
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });

  res.send("Version Lo12334");
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;