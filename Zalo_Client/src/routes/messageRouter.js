const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessageController');
const authController = require('../controllers/AuthController');

router.post('/addNewTextAndEmoji', authController.checkLoggedIn, messageController.addNewTextAndEmoji);
router.post('/uploadFiles', authController.checkLoggedIn, messageController.uploadFiles);

module.exports = router;