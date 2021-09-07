const User = require('../models/userModel');
const validator = require('validator');
const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Story = require('./../models/storyModel');
const multer = require('multer');
const sharp = require('sharp');
const { findById } = require('../models/userModel');
const userFriends = require('./../models/userFriends');

// const { post } = require('../routes/userRoutes');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Upload Appropiate Image!!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhotoCoverPhoto = upload.fields([
  { name: 'userPhoto', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]);

exports.resizePhotoCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.userPhoto && !req.files.coverPhoto) return next();
  const loginUser = await User.findById(req.user.id);
  if (req.files.userPhoto) {
    if (loginUser.userPhoto != 'profileD.png')
      fs.unlink(
        `${__dirname}/../public/users/${loginUser.userPhoto}`,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    req.body.userPhoto = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.userPhoto[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/users/${req.body.userPhoto}`);
  }
  if (req.files.coverPhoto) {
    if (loginUser.coverPhoto != 'coverPhotoD.jpg') {
      fs.unlink(
        `${__dirname}/../public/coverPhoto/${loginUser.coverPhoto}`,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    }
    req.body.coverPhoto = `coverPhoto-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.coverPhoto[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/coverPhoto/${req.body.coverPhoto}`);
  }
  next();
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.GetAllUser = catchAsync(async (req, res, next) => {
  const AllUser = await User.find();
  res.status(200).json({
    status: 'OK',
    length: AllUser.length,
    data: {
      AllUser,
    },
  });
  //res.status(200).render('users.ejs', { users: AllUser });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an Error If User tries to update Password (Post Password Data)
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Updates. Please Use /updateMyPassword',
        400
      )
    );
  }

  // Filtered Out unwanted fields name that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'username',
    'email',
    'DOB',
    'photo',
    'firstname',
    'lastname',
    'phoneNumber',
    'userPhoto',
    'coverPhoto'
  );

  // 2) Update User Document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.CreateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.GetUser = catchAsync(async (req, res, next) => {
  if (req.params.type == 'username') {
    const searchedUser = await User.find({ username: req.params.id });
    const searchedUserId = searchedUser[0].id;
    return res.status(200).json({
      status: 'OK',
      data: {
        searchedUserId,
      },
    });
  }

  const IdUser = await User.findById(req.params.id);

  if (!IdUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'OK',
    data: {
      IdUser,
    },
  });
});

exports.DeleteUser = catchAsync(async (req, res, next) => {
  const IdUser = await User.findByIdAndDelete(req.params.id);

  if (!IdUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const userName = req.params.userName.replace(/ /g, '');
  const searchedUser = await User.find({ username: userName }); // friend User
  if (searchedUser[0]) {
    const userId = searchedUser[0].id; // friends id
    if (userId == req.user.id) {
      return res.status(404).json({
        status: 'you cannot be friend of yourself here in ChiChat',
      });
    }
    const toBeFriend = await User.findById(userId);
    const checkBeforeAdd = await userFriends.find({
      $or: [
        {
          requestedUserId: { $eq: req.user.id },
          acceptedUserId: { $eq: userId },
        },
        {
          acceptedUserId: { $eq: req.user.id },
          requestedUserId: { $eq: userId },
        },
      ],
    });
    console.log(checkBeforeAdd);
    if (checkBeforeAdd.length === 0) {
      const roomId = userId + req.user.id + Date.now();
      const newUserFriends = await userFriends.create({
        requestedUserId: req.user.id,
        acceptedUserId: userId,
        chatRoomId: roomId,
      });
    }

    return res.status(200).json({
      status: 'Success',
    });
  } else {
    return next(new AppError('No user found with given id', 404));
  }
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const userName = req.params.userName.replace(/ /g, '');
  const searchedUser = await User.find({ username: userName });
  if (searchedUser[0]) {
    const userId = searchedUser[0].id;
    const toBeNotFriend = await User.findById(userId);
    const CurrentUser = req.user;
    const checkBeforeAdd = await userFriends.find({
      $or: [
        {
          requestedUserId: { $eq: req.user.id },
          acceptedUserId: { $eq: userId },
        },
        {
          acceptedUserId: { $eq: req.user.id },
          requestedUserId: { $eq: userId },
        },
      ],
    });
    if (checkBeforeAdd.length != 0) {
      const deletedUserFriends = await userFriends.findByIdAndRemove(
        checkBeforeAdd[0].id
      );
      console.log(deletedUserFriends);
    }
    return res.status(200).json({
      status: 'Success',
    });
  } else {
    return next(new AppError('No user found with given id', 404));
  }
});

exports.getMe = (req, res) => {
  res.status(200).json({
    user: res.locals.user,
  });
};

// Should be optimize in future
exports.FriendList = catchAsync(async (req, res, next) => {
  res.locals.friendlist = await userFriends
    .find({
      $or: [
        {
          requestedUserId: { $eq: req.user.id },
        },
        {
          acceptedUserId: { $eq: req.user.id },
        },
      ],
    })
    .populate('requestedUserId acceptedUserId');
  // console.log(res.locals.friendlist);
  next();
});

exports.FriendStory = catchAsync(async (req, res, next) => {
  var friendStory = [];
  const friendLists = res.locals.friendlist;
  var currentUser = req.user;
  for (var i = 0; i < friendLists.length; i++) {
    const acceptedUserId = friendLists[i].acceptedUserId.id;
    const requestedUserId = friendLists[i].requestedUserId.id;
    var obj = [];
    if (acceptedUserId == req.user.id) {
      obj = await Story.find({
        authorId: requestedUserId,
      });
    } else {
      obj = await Story.find({
        authorId: acceptedUserId,
      });
    }

    if (obj.length != 0) {
      friendStory.push(obj);
    }
  }
  res.locals.friendStory = friendStory;
  next();
});

const chitChatModel = require('./../models/chitChatModel');
exports.createUserFriendsChat = catchAsync(async (req, res, next) => {
  const recieverUserId = await User.find({
    username: req.body.recieverUserName,
  });
  if (recieverUserId) {
    const createdChat = await chitChatModel.create({
      message: req.body.chatFromYou,
      sender: req.user.id,
      reciever: recieverUserId[0].id,
      createdDate: Date.now(),
    });
    return res.status(200).json({
      status: 'success',
      data: createdChat,
    });
  }
  res.status(404).json({
    status: 'fail',
    message: 'no reciever found',
  });
});

exports.getUserFriendsChat = catchAsync(async (req, res, next) => {
  const last50Chat = await chitChatModel
    .find({
      $or: [
        {
          sender: req.user.id,
          reciever: req.query.recieverUserId,
        },
        {
          sender: req.query.recieverUserId,
          reciever: req.user.id,
        },
      ],
    })
    .sort({ createdDate: 1 });
  // console.log(last50Chat);
  res.status(200).json({
    status: 'OK',
    last50Chat,
  });
});

exports.deleteUserFriendsChat = catchAsync(async (req, res, next) => {
  const deletedChat = await chitChatModel.findOneAndDelete({
    _id: req.query.chatId,
    sender: req.user.id,
  });
  if (deletedChat) {
    return res.status(200).json({
      status: 'OK',
    });
  }
  res.status(401).json({
    status: 'fail',
    message: 'you can only delete chat send by you',
  });
});
exports.editUserFriendsChat = catchAsync(async (req, res, next) => {
  console.log('edited');
  // const last50Chat = await
  res.status(200).json({
    status: 'OK',
  });
});
