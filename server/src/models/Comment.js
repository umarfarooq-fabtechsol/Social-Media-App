const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Associated post is required']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required']
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [280, 'Comment cannot exceed 280 characters'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Comment', commentSchema);
