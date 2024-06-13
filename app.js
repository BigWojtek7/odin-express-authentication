require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const routes = require('./routes/index');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);

app.use(passport.session());

app.use(express.urlencoded({ extended: false }));

require('./config/passport');

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', routes);

app.listen(3000, () => console.log('app listening on port 3000!'));
