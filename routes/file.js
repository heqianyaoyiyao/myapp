const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 设置存储文件的配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 设置上传文件的保存路径
    cb(null, 'tmp/');
  },
  filename: function (req, file, cb) {
    // 设置上传文件的名称
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 初始化 multer 中间件
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.success({
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    res.error(error)
  }
})

module.exports = router