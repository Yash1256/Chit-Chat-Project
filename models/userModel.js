const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const randomData = require('mongoose-simple-random');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  firstname: {
    type: String,
    required: [true, 'Please provide your first name'],
    maxlength: 20,
  },
  lastname: {
    type: String,
    required: [true, 'Please provide your last name'],
    maxlength: 20,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phoneNumber: {
    type: Number,
    minlength: 10,
    required: [true, 'Please provide your Number'],
  },
  DOB: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  userPhoto: String,
  coverPhoto: String,
});
userSchema.plugin(randomData);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to current querry
  this.find({ active: { $ne: false } });
  // this.populate({
  //   path: 'friendList',
  // });
  next();
});

userSchema.methods.CheckPass = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.PasswordChanged = function (ExpiresAt) {
  if (this.passwordChangedAt) {
    const ChangeAtInms = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return ExpiresAt < ChangeAtInms;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
