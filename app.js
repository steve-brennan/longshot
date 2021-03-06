var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var dbsetup = require('./initDB');

//DEBUG=longshot:* npm run devstart
//Set up db connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://mongo:27017/longshot'; //docker run --name dev-mongo -d mongo

mongoose.connect(mongoDB, (error) => {
  if(error){console.log('MongoDB Error: '+error);}
});

//Initialise Database
dbsetup.populateDB();

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

console.log('Environment: ' + app.get('env'));

// Configure i18n
i18n.configure({
  directory: __dirname + '/locales'
});
//TODO: use update or remove
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init); // Uses 'accept-language' header to infer language

app.use('/', index);
app.use('/users', users);

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
