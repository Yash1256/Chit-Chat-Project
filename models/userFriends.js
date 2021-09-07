const mongoose = require('mongoose');

const userFriendsSchema = new mongoose.Schema({
  requestedUserId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  acceptedUserId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  chatRoomId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['requested', 'accepted'],
  },
});
userFriendsSchema.index({ requestedUserId: 1 });
userFriendsSchema.index({ acceptedUserId: 1 });
// userFriendsSchema.pre(/^find/, function (next) {
//   this.populate('acceptedUserId').select('acceptedUserId');
//   next();
// });
module.exports = mongoose.model('userFriends', userFriendsSchema);
