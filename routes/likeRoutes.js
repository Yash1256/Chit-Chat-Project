const express = require('express');
const PostController = require('../Controller/postController');
const authController = require('../Controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectAccess);
router.route('/').patch(PostController.Like);

module.exports = router;
