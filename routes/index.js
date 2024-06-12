const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user')

router.get('/', (req, res) => {
  console.log(process.env);
  res.render('index', { user: req.user });
});

router.get('/sign-up', (req, res) => res.render('sign-up-form'));
router.post('/sign-up', async (req, res, next) => {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) next(err);
    // otherwise, store hashedPassword in DB
    try {
      const user = new User({
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
