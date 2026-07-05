var express = require('express');
var router = express.Router();

// Takes user to the Swagger documentation when using API URL
router.get('/', function(req, res, next) {
  res.redirect("/docs");
});

module.exports = router;