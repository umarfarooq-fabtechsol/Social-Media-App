const Post = require('../models/Post');
const Comment = require('../models/Comment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Add comment to post
exports.addComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  // 1) Check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // 2) Create comment
  const comment = await Comment.create({
    post: req.params.id,
    author: req.user.id,
    content
  });

  // 3) Update post's comment count
  post.commentCount += 1;
  await post.save();

  // 4) Populate author info before sending response
  await comment.populate('author', 'username profilePicture');

  res.status(201).json({
    status: 'success',
    data: {
      comment
    }
  });
});

// Get all comments for a post
exports.getComments = catchAsync(async (req, res, next) => {
  // 1) Check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // 2) Get comments with pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: req.params.id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('author', 'username profilePicture');

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments
    }
  });
});