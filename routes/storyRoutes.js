const express = require('express');
const StoryController = require('./../Controller/storyController');
const authController = require('./../Controller/authController');
const { route } = require('./userRoutes');

const router = express.Router();

router.patch(
  '/',
  authController.protectAccess,
  StoryController.uploadStoryImg,
  StoryController.resizeStoryPhoto,
  StoryController.createStory
);

module.exports = router;
