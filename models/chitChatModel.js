const mongoose = require('mongoose');

const chitChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Number,
    default: Date.now(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});
chitChatSchema.index({ sender: 1 });
chitChatSchema.index({ reciever: 1 });
module.exports = mongoose.model('chitChat', chitChatSchema);
