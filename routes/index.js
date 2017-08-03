var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: res.__('TITLE'), welcome: res.__('WELCOME') });
});

module.exports = router;
