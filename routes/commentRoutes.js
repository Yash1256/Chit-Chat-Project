const express = require('express');
const PostController = require('./../Controller/postController');
const authController = require('./../Controller/authController');
const commentRoutes = require('./commentRoutes');
const commentController = require('./../Controller/commentController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectAccess);
router
  .route('/')
  .get(commentController.getAllPostComments)
  .post(commentController.createComment);

router
  .route('/:commentId')
  .patch(commentController.patchComment)
  .delete(commentController.deleteComment);

module.exports = router;
