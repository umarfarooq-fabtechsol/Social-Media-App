const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const validator = require('validator');

function toLower(value) {
  if (!value || typeof value !== 'string') return value;
  return value.toLowerCase();
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      lowercase: true, // Ensures case-insensitive uniqueness
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      set: toLower,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: ''
    },
    profilePicture: {
      type: String, // Store the URL of the image
      default: ''   // Can be a default placeholder image URL
    },
    interests: {
      type: [String],
      default: []
    },
     followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    lastLoginAt: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


userSchema.index({ interests: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password || this.password.length < 6) {
    return next(new Error('Password must be at least 6 characters long.'));
  }

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  return next();
});

// Compare passwords
userSchema.methods.comparePasswords = async function (incomingPassword, hashedPassword) {
  return await bcrypt.compare(incomingPassword, hashedPassword);
};

// Check if password changed after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = model('User', userSchema);
