// authController protection is to be set in the post model but for checking purposes it has been set over here

const express = require('express');
const UserController = require('./../Controller/userController');
const authController = require('./../Controller/authController');

const router = express.Router();

router.get('/getMe', authController.protectAccess, UserController.getMe);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protectAccess,
  authController.updatePassword
);
router.patch(
  '/updateMe',
  authController.protectAccess,
  UserController.uploadPhotoCoverPhoto,
  UserController.resizePhotoCoverPhoto,
  UserController.updateMe
);

router.delete(
  '/deleteMe',
  authController.protectAccess,
  UserController.deleteMe
);

router
  .route('/')
  .get(authController.protectAccess, UserController.GetAllUser)
  .post(UserController.CreateUser);

router
  .route('/:id/:type?')
  .get(authController.protectAccess, UserController.GetUser)
  .delete(
    authController.protectAccess,
    authController.restrictTo('admin'),
    UserController.DeleteUser
  );

router.use(authController.protectAccess);
router.route('/addFriend/:userName').patch(UserController.addFriend);
router.route('/removeFriend/:userName').patch(UserController.removeFriend);

module.exports = router;
// .patch(
//   authController.protectAccess,
//   UserController.uploadPhotoCoverPhoto,
//   UserController.uploadPhotoCoverPhoto,
//   UserController.UpdateUser
// );
