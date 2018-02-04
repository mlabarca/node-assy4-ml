const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var config = require('./config');


var index = require('./routes/index');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promotionsRouter');
var leaderRouter = require('./routes/leaderRouter');
var userRouter = require('./routes/userRouter');

const Dishes = require('./models/dishes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.Promise = require('bluebird');


// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  /*useMongoClient: true,
  /* other options */
});

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

app.use('/',index);
app.use('/users',userRouter);

function auth (req, res, next) {
    console.log(req.user);

    if (!req.user) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
    else {
      next();
    }
}

app.use(auth);
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
