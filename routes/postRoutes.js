const express = require('express');
const PostController = require('./../Controller/postController');
const authController = require('./../Controller/authController');
const userController = require('./../Controller/userController');
const commentRoutes = require('./commentRoutes');
const likeRoutes = require('./likeRoutes');

const router = express.Router();
router.use('/:postId/comments', commentRoutes);
router.use('/:postId/like', likeRoutes);

router
  .route('/')
  .get(
    authController.protectAccess,
    userController.FriendStory,
    PostController.getAllPost
  )
  .post(
    authController.protectAccess,
    PostController.uploadPostImg,
    PostController.resizeUserPhoto,
    PostController.CreatePost
  );

router.use(authController.protectAccess);
router
  .route('/:id')
  .get(PostController.getPostById)
  .patch(PostController.UpdatePost)
  .delete(PostController.DeleteOne);

module.exports = router;
