// 权限判断中间件
function authMiddleware(requiredAuth) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.error("Unauthorized", 401);
    }

    if (user.auth !== requiredAuth && user.auth !== 0) {
      return res.error("Forbidden", 403);
    }
    next();
  };
}

// module.exports = authMiddleware;
export default authMiddleware
