var express = require('express');
var router = express.Router();

let draw_numbers_controller = require('../controllers/drawNumbersController');

/* GET home page. */
router.get('/', draw_numbers_controller.index);

module.exports = router;
