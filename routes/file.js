const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 设置存储文件的配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directoryPath = path.join(__dirname, '../public/tmp/'+req.user.id);
    // 检查文件夹是否存在，如果不存在则创建
    if (!fs.existsSync(directoryPath)) {
      try {
        fs.mkdirSync(directoryPath, { recursive: true });
      } catch (error) {
        console.error(`Error creating directory: ${error.message}`);
      }
    }
    cb(null, `public/tmp/${req.user.id}/`);
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
      // path: req.file.path,
      path: `/tmp/${req.file.filename}`,
      originalname: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    res.error(error)
  }
})

/**
 * @method getFileNamesById 查找某个文件夹下所有文件
 * @param {String} directoryPath 文件夹路径
 * @param {number} page - 页码，从 1 开始
 * @param {number} pageSize - 每页显示的文件数量
 * @return { Array } 文件名数组
 */
const getFileNamesById = async(directoryPath, page = 1, pageSize = 10) => {
  try {
    // 读取文件夹下的所有文件和目录
    const items = await fs.promises.readdir(directoryPath)

    // 过滤出文件（排除文件夹）
    const files = items.filter(item => {
      const filePath = path.join(directoryPath, item)
      return fs.statSync(filePath).isFile()
    });

    // 计算分页参数
    const total = files.length
    const start = (page - 1) * pageSize
    const end = start + pageSize

    // 分页获取文件名
    const pagedFiles = files.slice(start, end)

    return { total, files: pagedFiles }
  } catch (err) {
    console.error('Error reading directory:', err.message)
    return { total: 0, files: [] }
  }
}

router.get('/getFiles', async (req, res) => {
  const { page, pageSize } = req.body
  const directoryPath = path.join(__dirname, '../public/tmp/' + req.user.id)
  if (!fs.existsSync(directoryPath)) {
    res.success([])
    return
  }
  const files = await getFileNamesById(directoryPath, page, pageSize)
  res.success(files)
})

module.exports = router