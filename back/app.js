const mongoose = require('mongoose')
const MONGO_HOST = '';
mongoose.connect(MONGO_HOST, {
    retryWrites: true,
    w: 'majority'
}).then(res => {
    console.log('DB연결성공')
}).catch(err=>{
    console.log(err)
})
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session')
const cors = require('cors')
app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
  );
//   app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000/', changeOrigin: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());    
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "my-secret",
        resave: true,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: false,
        }
    })
)

app.use('/', indexRouter);
app.use('/api', apiRouter);

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
