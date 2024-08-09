function responseFormatter(req, res, next) {
  // 保存原始的res.send
  const originalSend = res.send;

  // 重写res.send
  res.send = function (data) {
    // 格式化响应数据
    let responseData = {
      success: true,
      data: data,
    };

    // 如果data是Error类型，则认为是失败的响应
    if (data instanceof Error) {
      responseData = {
        success: false,
        error: {
          message: data.message,
          ...(process.env.NODE_ENV === 'development' && { stack: data.stack }), // 在开发环境下返回错误栈
        },
      };
    }

    // 调用原始的res.send方法
    originalSend.call(this, responseData);
  };

  next();
}


module.exports = responseFormatter;