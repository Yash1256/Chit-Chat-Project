const Post = require('./../models/postModel');
const fs = require('fs');
const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const {
  findByIdAndUpdate,
  findByIdAndDelete,
  findById,
} = require('./../models/postModel');
const { isValidObjectId } = require('mongoose');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Neither an image nor a video! Please upload images or video.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostImg = upload.single('image');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/posts/${req.file.filename}`);

  next();
});
exports.CreatePost = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  const filteredBody = {
    caption: req.body.caption,
    postContent: req.body.postContent,
    authorId: req.user.id,
    authorUsername: req.user.username,
  };
  if (req.file) {
    // FIXME HERE
    filteredBody.image = req.file.filename;
    // console.log(req.file.originalname);
  }
  const newPost = await Post.create(filteredBody);
  res.status(200).json({
    status: 'OK',
    data: {
      newPost,
    },
  });
});
exports.getAllPost = catchAsync(async (req, res, next) => {
  const allPost = await Post.find().populate({ path: 'authorId' });
  // JSON.stringify(allPost)
  res.status(200).json({
    status: 'Ok',
    data: {
      allPost,
    },
  });
});

exports.UpdatePost = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      caption: req.body.caption,
      postContent: req.body.postContent,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedPost) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'OK',
    data: {
      updatedPost,
    },
  });
});

exports.DeleteOne = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const postData = await Post.findById(id);
  if (postData.image)
    fs.unlink(`${__dirname}/../public/posts/${postData.image}`, (err) => {
      if (err) {
        throw err;
      }
    });
  const deletedOne = await Post.findByIdAndDelete(id);
  const deleteAllRelatedComment = await Comment.deleteMany({ postId: id });
  // TO be check in future
  if (!deletedOne) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'OK',
    data: null,
  });
});

exports.getPostById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const GetAllById = await Post.find({ authorId: id });
  res.status(200).json({
    status: 'OK',
    data: {
      GetAllById,
    },
  });
});

exports.Like = catchAsync(async (req, res, next) => {
  const username = req.user.username;
  const post_id = req.params.postId;
  var liked = false;
  const post = await Post.findById(post_id);
  if (!post) {
    return next(new AppError('No Post Found', 404));
  } else {
    const index = post.likes.indexOf(username);
    if (index > -1) {
      post.likes.splice(index, 1);
      liked = false;
    } else {
      post.likes.push(username);
      liked = true;
    }
  }
  post.save();
  // console.log(post.likes.length);
  res.status(200).json({
    status: 'OK',
    liked,
    data: {
      length: post.likes.length,
    },
  });
});
