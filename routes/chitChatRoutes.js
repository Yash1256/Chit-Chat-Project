const express = require('express');
const userController = require('../Controller/userController');
const authController = require('../Controller/authController');

const router = express.Router();

router.use(authController.protectAccess);
router
  .route('/')
  .get(userController.getUserFriendsChat)
  .post(userController.createUserFriendsChat)
  .delete(userController.deleteUserFriendsChat)
  .patch(userController.editUserFriendsChat);

module.exports = router;
