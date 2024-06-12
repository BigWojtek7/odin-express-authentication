const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/sign-up', (req, res) => res.render('sign-up-form'));
router.post('/sign-up', async (req, res, next) => {
  body('first_name', 'First Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape();
  body('last_name', 'Last Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape();
  body('username', 'First Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape();
  body('password', 'Last Name is required')
    .trim()
    .isLength({ min: 1 })
    .escape();
  body('re_password', 'Last Name is required')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .trim()
    .escape();
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) next(err);
    // otherwise, store hashedPassword in DB
    try {
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hashedPassword,
      });
      const result = await user.save();
      res.redirect('/');
    } catch (err) {
      return next(err);
    }
  });
});

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
