const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all user routes
router.use(authController.protect);

// User profile routes
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);

// Friend suggestions route
router.get('/suggestions', userController.getFriendSuggestions);

// Follow/unfollow routes
router.post('/:userId/follow', userController.followUser);
router.post('/:userId/unfollow', userController.unfollowUser);


module.exports = router;

