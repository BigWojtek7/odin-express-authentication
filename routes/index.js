const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hashedPassword,
    });
    if (!errors.isEmpty()) {
      console.log('walter');
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

router.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
