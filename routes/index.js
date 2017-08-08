var express = require('express');
var router = express.Router();

let draw_numbers_controller = require('../controllers/drawNumbersController');

/* GET home page. */
router.get('/', draw_numbers_controller.index);

router.get('/create', draw_numbers_controller.create);

router.get('/display', draw_numbers_controller.display);

router.get('/delete', draw_numbers_controller.delete);

module.exports = router;
