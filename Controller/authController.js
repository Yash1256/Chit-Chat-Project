const { promisify } = require('util');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const validator = require('validator');
const { findById } = require('./../models/userModel');

const SignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = SignToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;
  // process.env.userId = user.id;
  // process.env.userName = user.username;
  res.status(statusCode).json({
    status: 'OK',
    token: token,
    data: {
      user,
    },
  });
};
exports.getMe = catchAsync(async (req, res, next) => {
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  // Creating a new User
  const newUser = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    DOB: req.body.DOB,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userPhoto: 'profileD.png',
    coverPhoto: 'coverPhotoD.jpg',
  });
  //   console.log(newUser);
  // Signup Token used for Login Purpose
  const url = `${req.protocol}://${req.get('host')}/profile`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Geting the req body
  const DReq = { ...req.body };
  const EmailORUsername = DReq.username;
  const password = DReq.password;

  // check password and email
  if (!password || !EmailORUsername) {
    return next(new AppError('Username or password required', 500));
  }

  // If email validates it means user logged in using the email else by the Username
  if (validator.isEmail(EmailORUsername)) {
    const user = await User.findOne({ email: EmailORUsername }).select(
      '+password'
    );

    if (user && (await user.CheckPass(password, user.password))) {
      createSendToken(user, 200, req, res);
      //res.status(200).render('posts.ejs');
    } else {
      return next(new AppError('email and Password is not correct', 401));
    }
  } else {
    const user = await User.findOne({ username: EmailORUsername }).select(
      '+password'
    );
    if (user && (await user.CheckPass(password, user.password))) {
      createSendToken(user, 200, req, res);
      //res.status(200).render('posts.ejs');
    } else {
      return next(new AppError('username and Password is not correct', 401));
    }
  }
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'OK',
  });
};
// Protecting User not to access non-authorized data if he/she is not logged in
exports.protectAccess = catchAsync(async (req, res, next) => {
  // 1) Get token and checks if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (req.cookies.jwt) token = req.cookies.jwt;
  //   console.log(token);
  if (!token) {
    return next(
      new AppError('You are not Logged in! Please Login to get access', 401)
    );
  }

  // 2) validate if Token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);

  // 3) Check if User still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The User Belonging to this token does no longer exists !',
        401
      )
    );
  }

  // 4) Check if User changed Password after the token was issued
  if (currentUser.PasswordChanged(decoded.iat)) {
    return next(
      new AppError('User Recently Changed Password! Please Login Again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array => ['admin','lead-guide]. role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You don not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on Posted mail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No User with that email Address exists', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send back as an email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await Email({
      email: user.email,
      subject: 'Your Password Reset Token (valid for 10 min)',
      message,
    });

    // res.redirect(200, '/login');
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      token: resetToken,
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error occured while sendin mail Try again Later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is Invalid or has expired !!!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property of user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User from the Collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) If the Posted Password is Correct
  if (!(await user.CheckPass(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current Password is Wrong', 401));
  }

  // 3) If Password is Correct Update it
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Finally Log in User (Send JWT)
  createSendToken(user, 200, req, res);
});
