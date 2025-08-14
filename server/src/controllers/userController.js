const mongoose = require('mongoose');
const User = require('../models/users/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get current user profile
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password -passwordResetToken -passwordResetExpires')
    .populate({
      path: 'posts',
      select: 'content image likes createdAt',
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user profile
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Don't allow password update through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updatePassword.', 400)
    );
  }

  // 2) Filter out unwanted fields that shouldn't be updated
  const allowedFields = ['name', 'email', 'bio', 'profilePicture', 'interests'];
  const filteredBody = {};

  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) {
      // Handle interests array - ensure it's properly formatted
      if (el === 'interests') {
        if (Array.isArray(req.body[el])) {
          filteredBody[el] = req.body[el].slice(0, 10); // Limit to 10 interests
        }
      } else {
        filteredBody[el] = req.body[el];
      }
    }
  });

  // 3) Handle profile picture upload (assuming you're using multer)
  if (req.file) {
    filteredBody.profilePicture = req.file.path; // Or the URL from your storage service
  }

  // 4) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Get friend suggestions based on shared interests
const  getFriendSuggestions = catchAsync(async (req, res, next) => {
  // 1) Get current user's interests
  const currentUser = await User.findById(req.user.id).select('interests');
  if (!currentUser.interests || currentUser.interests.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'Add interests to get better suggestions',
      data: {
        suggestions: []
      }
    });
  }

  // 2) Find users with matching interests (excluding current user and existing friends)
  const suggestions = await User.aggregate([
    {
      $match: {
        _id: { $ne: req.user._id }, // Not the current user
        interests: { $in: currentUser.interests } // Shared interests
      }
    },
    {
      $addFields: {
        commonInterests: {
          $size: {
            $setIntersection: [currentUser.interests, '$interests']
          }
        }
      }
    },
    {
      $sort: { commonInterests: -1 } // Sort by most common interests first
    },
    {
      $limit: 10 // Limit to 10 suggestions
    },
    {
      $project: {
        username: 1,
        name: 1,
        profilePicture: 1,
        bio: 1,
        commonInterests: 1,
        interests: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: suggestions.length,
    data: {
      suggestions
    }
  });
  
});

// Follow a user
const followUser = catchAsync(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.userId);
  if (!userToFollow) {
    return next(new AppError('User not found', 404));
  }

  // Check if already following
  if (req.user.following.includes(req.params.userId)) {
    return next(new AppError('You are already following this user', 400));
  }

  // Update both users
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { following: req.params.userId }
  });

  await User.findByIdAndUpdate(req.params.userId, {
    $addToSet: { followers: req.user.id }
  });

  res.status(200).json({
    status: 'success',
    message: 'User followed successfully'
  });
});

// Unfollow a user
const unfollowUser = catchAsync(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.userId);
  if (!userToUnfollow) {
    return next(new AppError('User not found', 404));
  }

  // Check if not following
  if (!req.user.following.includes(req.params.userId)) {
    return next(new AppError('You are not following this user', 400));
  }

  // Update both users
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.userId }
  });

  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { followers: req.user.id }
  });

  res.status(200).json({
    status: 'success',
    message: 'User unfollowed successfully'
  });
});



module.exports = {
  getMe,
  updateMe,
  getFriendSuggestions,
  followUser,
  unfollowUser
};