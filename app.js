require('dotenv').config();
require('./utils/db');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const grant = require('grant').express();

var indexRouter = require('./routes/index');
var userApiRouter = require('./src/userapi/controller/UserApiController');
var stressApiRouter = require('./src/stressapi/controller/StressApiController');
var backfillRouter = require('./src/backfillapi/controller/BackfillController');
var OAuthController = require('./src/oauth/controller/OAuthController');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Grant configuration
const grantConfig = {
  "defaults": {
    "protocol": "https",
    "host": "emier-backend-caacbzexavbfa7gn.eastus-01.azurewebsites.net",
    // "protocol": "http",
    // "host": "localhost:3000",
    "transport": "session",
    "state": true
  },
  "garmin": {
    "request_url": process.env.OAUTH_REQUEST_TOKEN_URL,
    "authorize_url": process.env.OAUTH_CONFIRM_URL,
    "access_url": process.env.OAUTH_ACCESS_TOKEN_URL,
    "oauth": 1,
    "key": process.env.CONSUMER_KEY,
    "secret": process.env.CONSUMER_SECRET,
    // "callback": "http://localhost:3000/oauth/handle_garmin_callback",
    "callback": "https://emier-backend-caacbzexavbfa7gn.eastus-01.azurewebsites.net/oauth/handle_garmin_callback"
  }
};

app.use(session({ secret: 'grant', 
  resave: false, 
  saveUninitialized: true
 }));
app.use(grant(grantConfig));

app.use('/', indexRouter);
app.use('/user', userApiRouter);
app.use('/stress', stressApiRouter);
app.use('/backfill', backfillRouter);
app.use('/oauth', OAuthController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
