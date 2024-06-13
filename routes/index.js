const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Message = require('../models/message');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const allMessages = await Message.find()
      .sort({ date: 1 })
      .populate('user')
      .exec();
    res.render('index', { user: req.user, messages: allMessages });
  })
);

router.get('/sign-up', (req, res) =>
  res.render('sign-up-form', { errors: null })
);
router.post('/sign-up', [
  body('first_name', 'First Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('last_name', 'Last Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username', 'Username is required').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password is required').trim().isLength({ min: 1 }).escape(),
  body('re_password', 'Password does not match')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .trim()
    .escape(),
  body('is_admin').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hashedPassword,
      member_status: false,
      is_admin: req.body.is_admin === 'checked',
    });
    if (!errors.isEmpty()) {
      res.render('sign-up-form', {
        user: user,
        errors: errors.array(),
      });
    } else {
      await user.save();
      res.redirect('/');
    }
  }),
]);

router.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
  })
);

router.get('/create-message', (req, res) => {
  res.render('create-message', { errors: null });
});

router.post('/create-message', [
  body('title', 'title is require').trim().isLength({ min: 1 }).escape(),
  body('content', 'content is required').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      date: new Date(),
      user: req.user,
    });

    if (!errors.isEmpty()) {
      res.render('create-message', { message: message, errors: errors });
    } else {
      await message.save();
      res.redirect('/');
    }
  }),
]);

router.get('/join-club', (req, res) => {
  res.render('join-club');
});

router.post('/join-club', async (req, res) => {
  // const user = await User.findById(req.user.id).exec()
  if (req.body.password === process.env.SECRET_CLUB_PW) {
    await User.findByIdAndUpdate({ _id: req.user.id }, { member_status: true });
    res.redirect('/');
  } else {
    res.redirect('/join-club');
  }
});

router.get('/:id/delete', async (req, res) => {
  const message = await Message.findById(req.params.id).exec();
  res.render('delete', { title: 'Delete message', message: message });
});

router.post(
  '/:id/delete',
  asyncHandler(async (req, res, next) => {
    await Message.findByIdAndDelete(req.body.messageid);
    res.redirect('/');
  })
);

router.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
