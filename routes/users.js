// const express = require('express')
// // var axios = require('axios')
// const db = require('../sql/connectDB')
// const { loginSubmit, getPath } = require('../until/user')
// const { secretKey, resetTokenSecretKey } = require('./config')

import express from 'express';
import db from '../sql/connectDB.js';
import { loginSubmit, getPath } from '../until/user.js';
import { secretKey, resetTokenSecretKey } from './config.js';

// const crypto = require('crypto')
// const bcrypt = require('bcryptjs')
// const router = express.Router()
// const jwt = require('jsonwebtoken')
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// var serverAddress = 'http://stage.ezkit.net:12180'
// http://server/?user/index/loginSubmit&name=[用户名]&password=[密码]
// http://stage.ezkit.net:12180/
//     帐号：stagego
//     密码：xpUtOcLH

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource -- users');
});

// 登录路由
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 检查用户是否存在
    const query = 'SELECT * FROM users WHERE username = ?';
    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.error('用户不存在', 401);
    }

    const user = results[0];

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.error('密码错误', 401);
    }

    // 生成JWT，设置过期时间为12小时
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '12h' });

    // 返回用户信息和令牌
    const userData = {
      id: user.id,
      username: user.username,
    };
    res.success({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.error('服务器内部错误', 500);
  }
});

// 注册
router.post('/regist', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 检查用户是否已存在
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    const [results] = await db.query(checkUserQuery, [username]);

    if (results.length > 0) {
      return res.error('用户已存在', 409);
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await db.query(insertUserQuery, [username, hashedPassword]);

    res.success({}, '注册成功');
  } catch (error) {
    console.error('Register error:', error);
    res.error('服务器内部错误', 500);
  }
});

// 登出
router.post('/logout', (req, res) => {
  // 返回成功的响应
  res.success({}, '登出成功');
});

// 获取用户列表
router.get('/getUserList', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    // 获取总记录数的查询
    const totalQuery = 'SELECT COUNT(*) AS total FROM users';
    const [totalResults] = await db.query(totalQuery);
    const total = totalResults[0].total;

    // 分页查询
    const offset = (page - 1) * pageSize;
    const sql = 'SELECT id, username, user_auth, avatarUrl FROM users LIMIT ? OFFSET ?';
    const [users] = await db.query(sql, [parseInt(pageSize), parseInt(offset)]);

    const data = users.map((item) => ({
      id: item.id,
      username: item.username,
      user_auth: item.user_auth,
      avatarUrl: item.avatarUrl,
    }));

    res.success({ total, list: data });
  } catch (error) {
    console.error('Get user list error:', error);
    res.error('服务器内部错误', 500);
  }
});

// 重置密码链接
router.get('/getResetPasswordToken', async (req, res) => {
  const { username } = req.query;

  try {
    const sql = 'SELECT id FROM users WHERE username = ?';
    const [results] = await db.query(sql, [username]);

    if (results.length === 0) {
      return res.error('用户不存在', 404);
    }

    const user = results[0];
    const resetToken = jwt.sign({ id: user.id }, resetTokenSecretKey, { expiresIn: '15m' }); // 令牌有效期15分钟

    res.success(resetToken);
  } catch (error) {
    console.error('Get reset password token error:', error);
    res.error('服务器内部错误', 500);
  }
});

// 重置密码
router.post('/resetPassword', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // 验证 token
    const decoded = jwt.verify(resetToken, resetTokenSecretKey);
    const userId = decoded.id;

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(sql, [hashedPassword, userId]);

    res.success({}, '密码已重置');
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.error('无效或过期的令牌', 400);
    }
    res.error('服务器内部错误', 500);
  }
});

// 检查token是否有效
router.get('/checkToken', (req, res) => {
  res.success({}, 'Token 有效');
});

// 删除用户
router.post('/delUser', async (req, res) => {
  const { userId } = req.body;

  try {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [userId]);

    res.success({}, '用户已删除');
  } catch (error) {
    console.error('Delete user error:', error);
    res.error('服务器内部错误', 500);
  }
});

// module.exports = router
export default router;