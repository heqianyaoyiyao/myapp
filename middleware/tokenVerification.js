
const jwt = require('jsonwebtoken');
const { secretKey } = require('../routes/config')

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
const excludeRouter = ['/users/login', '/users/regist', '/users/getResetPasswordToken', '/users']
function skipTokenVerification(req, res, next) {
  // 如果请求路径是这些，直接跳过 verifyToken 验证
  if (excludeRouter.includes(req.path)) {
    return next();
  }

  // 如果当前请求路径是resetPassword开头，则跳过中间件
  if (req.path.startsWith('/users/resetPassword')) {
    return next();
  }
  
  // 其他路径则进行Token验证
  verifyToken(req, res, next);
}

module.exports = skipTokenVerification;