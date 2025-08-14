const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');

const router = express.Router();

// Protect all post routes
router.use(authController.protect);

// Post statistics
router.get('/stats', postController.getPostStats);

// Like routes
router.post('/:id/like', likeController.toggleLike);

// Comment routes
router.route('/:id/comments')
  .post(commentController.addComment)
  .get(commentController.getComments);

// Post routes
router
  .route('/')
  .get(postController.getAllPosts)
  .post(postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

// Like/unlike post
router.post('/:id/like', postController.toggleLike);

module.exports = router;