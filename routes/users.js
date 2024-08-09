var express = require('express');
var router = express.Router();
// var axios = require('axios')
const db = require('../sql/connectDB')

const { loginSubmit, getPath } = require('../until/user')

const crypto = require('crypto');

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

router.get('/getUserList', (req, res, next) => {
  db.query('SELECT * FROM `users`', (err, result) => {
    if (err) return err.message
    res.send(result)
  })
})

router.post('/login', async(req,res,next) => {
  db.query(`SELECT * FROM users WHERE user_name = '${req.body.name}' AND user_password = '${req.body.password}'`, (err,result) => {
    if (err) throw err
    console.log(result)
    if (result.length === 0) {
      res.send({
        data: result,
        msg: '用户不存在或密码错误'
      })
      return
    }
    res.cookie('token', crypto.randomBytes(32).toString('hex'))
    res.send({
      data: result
    })
  })
})

router.post('/regist', async(req, res) => {
  const { name, password } = req.body

  // 检查用户是否已存在
  const checkUserQuery = 'SELECT * FROM users WHERE user_name = ?';
  db.query(checkUserQuery, [name], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const insertUserQuery = 'INSERT INTO users (name, password) VALUES (?, ?)';
    db.query(insertUserQuery, [name, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
})

module.exports = router;
