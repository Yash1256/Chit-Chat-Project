const User = require('../models/userModel');
const Story = require('../models/storyModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

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

exports.uploadStoryImg = upload.single('storyPhoto');

exports.resizeStoryPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `story-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/story/${req.file.filename}`);
  next();
});

exports.createStory = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.storyPhoto = req.file.filename;
  }
  req.body.authorId = req.user.id;
  // var hrTime = process.hrtime();
  req.body.expiresAt = Date.now() + 30 * 1000;
  // hrTime[0] * 1000000 + hrTime[1] / 1000 + 2 * 60 * 1000000;
  req.body.authorUserName = req.user.username;
  req.body.authorFirstName = req.user.firstname;
  const IdUser = await User.findById(req.user.id);
  if (!IdUser) {
    return next(new AppError('No user found with that ID', 404));
  }
  const story = await Story.create(req.body);
  res.status(200).json({
    status: 'OK',
    data: {
      story,
    },
  });
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  // FIX IT
  var id = req.params.id;
  const findStory = await Story.findById(id);
  if (findStory.storyPhoto) {
    fs.unlink(`${__dirname}/../public/story/${findStory.storyPhoto}`, (err) => {
      if (err) {
        throw err;
      }
    });
  }
  const story = await Story.findByIdAndDelete(id);
  if (!story) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'OK',
    data: null,
  });
});
