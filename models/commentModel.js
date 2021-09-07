const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  dateadded: {
    type: Date,
    default: Date.now(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  postId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  authorUsername: String,
  likes: [String],
});
commentSchema.index({ postId: 1 });
module.exports = mongoose.model('Comment', commentSchema);
