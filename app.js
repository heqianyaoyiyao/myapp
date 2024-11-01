// var createError = require('http-errors')
// var express = require('express')
// var path = require('path')
// var cookieParser = require('cookie-parser')
// var logger = require('morgan')
// var bodyParser = require('body-parser')
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url';

// var indexRouter = require('./routes/index.js')
// var usersRouter = require('./routes/users')
// const fileRouter = require('./routes/file.js')
// const chatRouter = require('./routes/chat.js')
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import fileRouter from './routes/file.js'
import chatRouter from './routes/chat.js'

// const cors = require('cors');
// const responseMiddleware = require('./middleware/responseMiddleware');
// const skipTokenVerificationMiddleware = require('./middleware/tokenVerification')
// const authMiddleware = require('./middleware/authMiddleware')
import responseMiddleware from './middleware/responseMiddleware.js'
import skipTokenVerificationMiddleware from './middleware/tokenVerification.js'

var app = express();

// app.use(cors());
// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// 获取当前模块的文件路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块的目录路径
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())//数据JSON类型
app.use(bodyParser.urlencoded({ extended: false }))//解析post请求数据

// 应用全局中间件 格式化响应数据
app.use(responseMiddleware)

// 应用全局中间件（包括Token验证）
app.use(skipTokenVerificationMiddleware)
// app.use(authMiddleware)

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/file', fileRouter)
app.use('/chat', chatRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// module.exports = app
export default app
