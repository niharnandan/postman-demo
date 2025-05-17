const express = require('express');
const router = express.Router();
const getAvatarCharactersController = require('../controllers/getAvatarCharactersController');

router.get('/characters', getAvatarCharactersController.getAvatarCharacters);

module.exports = router;