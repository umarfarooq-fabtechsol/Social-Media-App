const Post = require('../models/Post');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Like/unlike post
exports.toggleLike = catchAsync(async (req, res, next) => {
  // 1) Check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // 2) Check if user already liked the post
  const likeIndex = post.likes.indexOf(req.user.id);

  if (likeIndex === -1) {
    // Like the post
    post.likes.push(req.user.id);
    post.likeCount += 1;
  } else {
    // Unlike the post
    post.likes.splice(likeIndex, 1);
    post.likeCount -= 1;
  }

  // 3) Save the post
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      liked: likeIndex === -1, // true if now liked, false if now unliked
      likeCount: post.likeCount
    }
  });
});