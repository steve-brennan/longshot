let express = require('express');
let router = express.Router();

let draw_numbers_controller = require('../controllers/drawNumbersController');
let probable_number_set_controller = require('../controllers/probableNumberSetController');

/* GET home page. */
router.get('/', probable_number_set_controller.index);

router.get('/create', draw_numbers_controller.create);

router.get('/display', draw_numbers_controller.display);

router.get('/delete', draw_numbers_controller.delete);

module.exports = router;
