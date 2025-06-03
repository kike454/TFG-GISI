const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
//const session = require('express-session');
//const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./database');
require('dotenv').config();
const { seedDatabase } = require('./database/seed');



const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const reservasRouter = require('./routes/reservas');
const superUsersRouter = require('./routes/superUsers');
const stripeCheckout = require('./stripe/createCheckoutSession');
const stripeWebhook = require('./stripe/webhooks');

//console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET);

const app = express();


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

app.use('/api/stripe', stripeWebhook);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/books', booksRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/superusers', superUsersRouter);
app.use('/api/stripe', stripeCheckout);


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


async function connectWithRetry() {
  let retries = 10;

  while (retries) {
    try {
      await sequelize.authenticate();
      console.log(' Conexión a PostgreSQL establecida');
      await sequelize.sync({ alter: true });
      await seedDatabase();
      console.log(' Tablas sincronizadas con Sequelize');
      
      break;
    } catch (err) {
      console.log(` DB no está lista todavía, reintentando... (${10 - retries + 1})`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (!retries) {
    console.error(' No se pudo conectar a la base de datos');
    process.exit(1);
  }
}

connectWithRetry();

module.exports = app;