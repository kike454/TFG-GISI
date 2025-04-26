var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./database');



const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000, 
  expiration: 24 * 60 * 60 * 1000 
});

sessionStore.sync();




var indexRouter = require('./routes/index');

const usersRouter = require('./routes/users'); 

var app = express();

//CROSS
app.use(cors({
  origin: "http://localhost:5000", 
  credentials: true
}));



// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'una-clave-super-secreta',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: false,
    httpOnly: true
  }
}));

app.use('/', indexRouter);
app.use('/api/users', usersRouter); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: err
  });

});

module.exports = app;
