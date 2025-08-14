const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [280, 'Post content cannot exceed 280 characters'],
      trim: true
    },
    image: {
      type: String,
      default: '' // Optional image URL
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate likes
postSchema.methods.toggleLike = function (userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
    this.likeCount++;
  } else {
    this.likes.splice(index, 1);
    this.likeCount--;
  }
  return this.save();
};

module.exports = model('Post', postSchema);
