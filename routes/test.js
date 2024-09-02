const fs = require('fs');
const path = require('path');

// 要创建的文件夹路径
const directoryPath = path.join(__dirname, '../public/tmp/newFolder');

// 检查文件夹是否存在，如果不存在则创建
if (!fs.existsSync(directoryPath)) {
  try {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory created: ${directoryPath}`);
  } catch (error) {
    console.error(`Error creating directory: ${error.message}`);
  }
} else {
  console.log(`Directory already exists: ${directoryPath}`);
}
