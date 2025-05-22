

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
//const session = require('express-session');
//const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./database');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const reservasRouter = require('./routes/reservas');
const superUsersRouter = require('./routes/superUsers');

const app = express();

/*
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
});
sessionStore.sync();

*/
const allowedOrigins = [
  'http://localhost:5000',
  'https://grema.store',
  'https://www.grema.store'
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
app.use(session({
  secret: 'una-clave-super-secreta',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, 
    httpOnly: true,
    sameSite: 'lax' 
  }
}));
*/

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/books', booksRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/superusers', superUsersRouter);

// 404 y error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: err
  });
});

module.exports = app;
