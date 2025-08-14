const Post = require('../models/Post');
const User = require('../models/users/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const { postCreateSchema, postUpdateSchema } = require('../utils/joi/postValidation');

// Get all posts with filtering, sorting, and pagination
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const filter = {};
  const query = {};
  const limitFields = {};

  // Filter by author
  if (req.query.author) {
    filter.author = req.query.author;
  }

  // Text search in content
  if (req.query.search) {
    filter.content = { $regex: req.query.search, $options: 'i' };
  }

  // Sort
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy.split(',').join(' ');
    query.sort = sortBy;
  } else {
    // Default sort by newest first
    query.sort = '-createdAt';
  }

  // Limit fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    limitFields.select = fields;
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  query.skip = skip;
  query.limit = limit;

  const posts = await Post.find(filter, limitFields.select, query)
    .populate('author', 'username profilePicture')
    .populate('likes', 'username profilePicture');

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

// Get single post
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username profilePicture')
    .populate('likes', 'username profilePicture');

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

// Create new post
exports.createPost = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error } = postCreateSchema.validate(req.body);
  if (error) {
    const fieldErrors = error.details.reduce((acc, err) => {
      acc[err.context.key] = err.message;
      return acc;
    }, {});
    return next(new AppError('Validation failed', 400, fieldErrors));
  }

  // Add author field
  req.body.author = req.user.id;

  const newPost = await Post.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

// Update post
exports.updatePost = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error } = postUpdateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });
  if (error) {
    const fieldErrors = error.details.reduce((acc, err) => {
      acc[err.context.key] = err.message;
      return acc;
    }, {});
    return next(new AppError('Validation failed', 400, fieldErrors));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // Check if the user is the author of the post
  if (post.author.toString() !== req.user.id) {
    return next(new AppError('You can only update your own posts', 403));
  }

  // Prevent updating likes through this endpoint
  if (req.body.likes || req.body.likeCount) {
    return next(new AppError('Cannot update likes through this endpoint', 400));
  }

  post.content = req.body.content || post.content;
  post.image = req.body.image !== undefined ? req.body.image : post.image;
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

// Delete post
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // Check if the user is the author of the post
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own posts', 403));
  }

  await post.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Toggle like on post
exports.toggleLike = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  await post.toggleLike(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

// Get post statistics
exports.getPostStats = catchAsync(async (req, res, next) => {
  const stats = await Post.aggregate([
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        avgLikes: { $avg: '$likeCount' },
        avgComments: { $avg: '$commentCount' }
      }
    }
  ]);

  const topPosts = await Post.find()
    .sort('-likeCount')
    .limit(5)
    .populate('author', 'username');

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0],
      topPosts
    }
  });
});