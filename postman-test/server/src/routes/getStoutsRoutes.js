const express = require('express');
const router = express.Router();
const getStoutsController = require('../controllers/getStoutsController');

router.get('/stouts', getStoutsController.getStouts);

module.exports = router;