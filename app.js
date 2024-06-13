require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const MongoStore = require('connect-mongo')

const routes = require('./routes/index');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts)

app.use(
  session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24}, // one day
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);

app.use(passport.session());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport');

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', routes);

app.listen(3000, () => console.log('app listening on port 3000!'));
