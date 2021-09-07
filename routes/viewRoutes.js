const { response } = require('express');
const express = require('express');
// const postController = require('./../Controller/postController');
const User = require('./../models/userModel');
const authController = require('./../Controller/authController');
const userController = require('./../Controller/userController');
const Post = require('./../models/postModel');
const axios = require('axios');
const AppError = require('../utils/appError');
const Story = require('../models/storyModel');
const userFriends = require('../models/userFriends');
const router = express.Router();

router.route('/login').get((req, res, next) => {
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) res.render('authorization.ejs');
  else res.redirect('/newsFeed');
});
// router.route('/register').get((req, res, next) => {
//   res.render('register.ejs');
// });

// router.route('/forgotPassword').get((req, res, next) => {
//   res.render('forgotPassword.ejs');
// });

// router.use(authController.protectAccess);

router
  .route('/newsFeed')
  .get(
    authController.protectAccess,
    userController.FriendList,
    userController.FriendStory,
    async (req, res, next) => {
      const post = await Post.find().populate({ path: 'authorId' });
      const userStory = await Story.find({ authorId: req.user.id });

      //   $or: [
      //     { requestedUserId: { $ne: ['requestedUserId', req.user] } },
      //     { acceptedUserId: { $ne: ['acceptedUserId', req.user] } },
      //   ],

      // console.log(res.locals.friendlist);
      User.findRandom({}, {}, { limit: 6 }, function (err, results) {
        if (err) next(new AppError(err, 404));
        if (!results) results = [];

        res.render('newsFeed.ejs', {
          allPosts: post,
          friendSuggestion: results,
          userStory: userStory,
        });
      });
    }
  );
router
  .route('/profile')
  .get(
    authController.protectAccess,
    userController.FriendList,
    async (req, res, next) => {
      const post = await Post.find({ authorId: req.user.id }).populate({
        path: 'authorId',
      });
      res.render('profile.ejs', { allPosts: post });
    }
  );

router
  .route('/chitChat')
  .get(
    authController.protectAccess,
    userController.FriendList,
    (req, res, next) => {
      res.render('chitChat.ejs');
    }
  );
module.exports = router;
