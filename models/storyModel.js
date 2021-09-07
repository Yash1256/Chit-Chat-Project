const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  storyPhoto: String,
  content: String,
  expiresAt: {
    type: Number,
    default: Date.now() + 60 * 1000,
  },
  authorFirstName: String,
  authorUserName: String,
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});
storySchema.index({ authorId: 1 });
storySchema.index({ expiresAt: 1 });
module.exports = mongoose.model('Story', storySchema);
