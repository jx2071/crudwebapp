const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table_controller');

router.get('/', tableController.view);
router.post('/', tableController.find);
router.get('/addrecord', tableController.form);
router.post('/addrecord', tableController.insert);
router.get('/editrecord/:id', tableController.edit);
router.post('/editrecord/:id', tableController.update);

module.exports = router;