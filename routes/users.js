var express = require('express');
var router = express.Router();
// var axios = require('axios')
const db = require('../sql/connectDB')

const { loginSubmit, getPath } = require('../until/user')

const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const { secretKey, resetTokenSecretKey } = require('./config')
const jwt = require('jsonwebtoken');

// var serverAddress = 'http://stage.ezkit.net:12180'
// http://server/?user/index/loginSubmit&name=[用户名]&password=[密码]
// http://stage.ezkit.net:12180/
//     帐号：stagego
//     密码：xpUtOcLH
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource -- users');
});

// router.get('/login',function(req, res, next) {
//   const query = {
//     name: req.query.name,
//     password: req.query.password
//   }
//   loginSubmit({
//     name: query.name,
//     password: query.password
//   }).then((result) => {
//     res.cookie('loginToken', result.data.info)
//     res.send(result.data);
//   })
// })

// router.post('/getPath', (req, res, next) => {
//   // const loginToken = req.query.loginToken
//   // console.log('cookies', req.cookies)
//   // axios.get(serverAddress + `/index.php?explorer/list/path&accessToken=${loginToken}`).then(function (response) {
//   //   const data = response.data
//   //   res.send({
//   //     data,
//   //   });
//   // })
//   const loginToken = req.cookies.loginToken || req.query.loginToken
//   getPath({ accessToken: loginToken }).then((response) => {
//     const data = response.data
//     res.send(data);
//   }).catch(err => {
//     res.send(err)
//   })
// })

// 登录路由
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 检查用户是否存在
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      // return res.status(500).json({ message: 'Database error' });
      return res.error('Database error', 500);
    }

    if (results.length === 0) {
      // return res.status(401).json({ message: 'User not found' });
      return res.error('用户不存在', 401);
    }

    const user = results[0];

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // return res.status(401).json({ message: 'Incorrect password' });
      return res.error('密码错误', 401);
    }

    // 生成JWT Token，设置过期时间为1小时
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '6h' });

    // 返回用户信息和令牌
    const userData = {
      id: user.id,
      username: user.username
    };
    // res.json({ message: 'Login successful', token });
    res.success({ user: userData, token: token });
  });
});

// 注册
router.post('/regist', async(req, res) => {
  const { username, password } = req.body;

  // 检查用户是否已存在
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserQuery, [username], async (err, results) => {
    if (err) {
      // return res.status(500).json({ message: 'Database error' });
      return res.error('Database error', 500)
    }

    if (results.length > 0) {
      // return res.status(409).json({ message: 'User already exists' });
      return res.error('用户已存在', 409)
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertUserQuery, [username, hashedPassword], (err, results) => {
      if (err) {
        // return res.status(500).json({ message: 'Database error' });
        return res.error('Database error', 500)
      }

      // res.status(201).json({ message: 'User registered successfully' });
      res.success()
    });
  });
})

// 登出
router.post('/logout', (req, res, next) => {
  // 返回成功的响应
  res.success({});
})

// 获取用户列表
router.get('/getUserList', (req, res, next) => {
  // console.log('user', req.user)
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      // console.error('Error fetching users:', err.stack);
      return res.error('Error fetching users:', 500);;
    }
    // res.json(result);
    res.success(result);
  })
})

// 更新密码（邮件）
// 设置邮件发送
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your_email@gmail.com',
//     pass: 'your_email_password'
//   }
// });
// router.post('/resetPassowrd',(req, res) => {
  // const { email } = req.body;
  // 查找用户
  // const sql = 'SELECT id FROM users WHERE email = ?';
  // db.query(sql, [email], (err, results) => {
  //   if (err) {
  //     return res.error('Database error', 500);
  //   }

  //   if (results.length === 0) {
  //     return res.error('User not found', 404);
  //   }

  //   const user = results[0]
    // const resetToken = jwt.sign({ id: user.id }, resetTokenSecretKey, { expiresIn: '15m' }); // 令牌有效期15分钟
    // // 构建重置密码链接
    // const resetLink = `http://yourdomain.com/reset-password/${resetToken}`;

    // // 发送邮件
    // const mailOptions = {
    //   from: 'your_email@gmail.com',
    //   to: email,
    //   subject: 'Password Reset',
    //   text: `Click the following link to reset your password: ${resetLink}`
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     return res.error('Error sending email', 500);
    //   }
    //   res.success({}, 'Password reset link has been sent to your email.');
    // });
//   })
// })

// 重置密码
// router.post('/api/reset-password/:token', (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   // 验证 token
//   jwt.verify(token, resetTokenSecretKey, (err, decoded) => {
//     if (err) {
//       return res.error('Invalid or expired token', 400);
//     }

//     const userId = decoded.id;

//     // 哈希新密码
//     bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
//       if (err) {
//         return res.error('Error hashing password', 500);
//       }

//       // 更新密码
//       const sql = 'UPDATE users SET password = ? WHERE id = ?';
//       db.query(sql, [hashedPassword, userId], (err, result) => {
//         if (err) {
//           return res.error('Database error', 500);
//         }

//         res.success({}, 'Password has been reset successfully.');
//       });
//     });
//   });
// });

// 重置密码链接
router.get('/getResetPasswordToken',(req, res, next) => {
  const { username } = req.query
  const sql = 'SELECT id FROM users WHERE username = ?'
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.error('Database error', 500);
    }

    if (results.length === 0) {
      return res.error('用户不存在', 404);
    }

    const user = results[0];
    const resetToken = jwt.sign({ id: user.id }, resetTokenSecretKey, { expiresIn: '15m' }); // 令牌有效期15分钟
    // 构建重置密码链接
    // const resetLink = `http://47.107.28.73:2333/resetPassword/${resetToken}`;

    res.success(resetToken)
  })
})

// 重置密码
router.post('/resetPassword', (req, res) => {
  const { resetToken, newPassword } = req.body;

  // 验证 token
  jwt.verify(resetToken, resetTokenSecretKey, (err, decoded) => {
    if (err) {
      return res.error('Invalid or expired token', 400);
    }

    const userId = decoded.id;

    // 哈希新密码
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.error('Error hashing password', 500);
      }

      // 更新密码
      const sql = 'UPDATE users SET password = ? WHERE id = ?';
      db.query(sql, [hashedPassword, userId], (err, result) => {
        if (err) {
          return res.error('Database error', 500);
        }

        res.success({});
      });
    });
  });
})

// 检查token是否有效
router.get('/checkToken', (req, res) => {
  res.success({});
})

module.exports = router;
