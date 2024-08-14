var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// const cors = require('cors');
const responseMiddleware = require('./until/responseMiddleware');

var app = express();

// app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据

const { secretKey } = require('./routes/config')
const jwt = require('jsonwebtoken');
app.use(responseMiddleware);

// 验证Token的中间件
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    // return res.status(403).json({ message: 'Token required' });
    return res.error('Token required', 403)
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // return res.status(403).json({ message: 'Invalid or expired token' });
      return res.error('Invalid or expired token', 403)
    }

    req.user = decoded; // 将解码后的用户信息存入请求对象
    next();
  });
}

// 排除特定路由的中间件
function skipTokenVerification(req, res, next) {
  console.log(req.path)
  // 如果请求路径是这些，直接跳过 verifyToken 验证
  console.log(req.path)
  if (req.path === '/users/login' || req.path === '/users/regist' || req.path === '/users/getResetPasswordToken' || req.path.startsWith('/public')) {
    return next();
  }

  // 如果当前请求路径是resetPassword开头，则跳过中间件
  if (req.path.startsWith('/users/resetPassword')) {
    return next();
  }
  
  // 其他路径则进行Token验证
  verifyToken(req, res, next);
}

// 应用全局中间件（包括Token验证）
app.use(skipTokenVerification);

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
