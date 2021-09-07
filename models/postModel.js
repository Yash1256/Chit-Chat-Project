const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: String,
  postContent: String,
  createdDate: {
    type: Number,
    default: new Date().getTime(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  authorUsername: String,
  commentCount: {
    type: Number,
    default: 0,
  },
  likes: [String],
  image: String,
});
module.exports = mongoose.model('Post', postSchema);
