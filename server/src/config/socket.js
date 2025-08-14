// config/socket.js
const Chat = require('../models/Chat');
const User = require('../models/users/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Make sure to import Comment model

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their own room for private messages
    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // One-to-one chat implementation
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        const message = await Chat.create({
          sender: senderId,
          receiver: receiverId,
          content
        });

        const populatedMessage = await Chat.findById(message._id)
          .populate('sender', 'username profilePicture')
          .populate('receiver', 'username profilePicture');

        io.to(receiverId).to(senderId).emit('receiveMessage', populatedMessage);
      } catch (err) {
        console.error(err);
      }
    });

    // Live like updates
    socket.on('postLiked', async ({ postId, userId }) => {
      try {
        const post = await Post.findById(postId);
        if (!post) return;

        const likeIndex = post.likes.indexOf(userId);
        const liked = likeIndex === -1;

        if (liked) {
          post.likes.push(userId);
          post.likeCount += 1;
        } else {
          post.likes.splice(likeIndex, 1);
          post.likeCount -= 1;
        }

        await post.save();

        io.emit('likeUpdate', {
          postId,
          likeCount: post.likeCount,
          liked,
          userId
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Live comment updates
    socket.on('newComment', async ({ postId, userId, content }) => {
      try {
        const comment = await Comment.create({
          post: postId,
          author: userId,
          content
        });

        const populatedComment = await Comment.findById(comment._id).populate(
          'author',
          'username profilePicture'
        );

        const post = await Post.findByIdAndUpdate(postId, {
          $inc: { commentCount: 1 }
        });

        io.emit('commentUpdate', {
          postId,
          comment: populatedComment,
          commentCount: post.commentCount + 1
        });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket; 
