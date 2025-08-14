const { Schema, model } = require('mongoose');

const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower is required']
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following user is required']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate follow entries
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = model('Follow', followSchema);
