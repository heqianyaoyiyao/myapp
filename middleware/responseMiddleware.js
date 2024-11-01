// 响应中间件
// 格式化响应内容
function responseMiddleware(req, res, next) {
  res.success = (data = {}, message = 'success', code = 200) => {
    // res.status(code).json({
    //   code: code,
    //   data: data,
    //   message: message,
    // });
    res.status(200).json({
      code: code,
      data: data,
      message: message,
    });
  };

  res.error = (message = 'error', code = 500, data = {}) => {
    // res.status(code).json({
    //   code: code,
    //   data: data,
    //   message: message,
    // });
    res.status(200).json({
      code: code,
      data: data,
      message: message,
    });
  };

  next();
}

// module.exports = responseMiddleware;
export default responseMiddleware