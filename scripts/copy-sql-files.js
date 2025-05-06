const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = path.join(__dirname, '../src/main/services/database/scripts');
const targetDir = path.join(__dirname, '../build/main/main/services/database/scripts');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`已创建目录: ${targetDir}`);
}

// 读取源目录中的所有文件
const files = fs.readdirSync(sourceDir);

// 复制每个文件
files.forEach(file => {
  if (file.endsWith('.sql')) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`已复制 ${sourcePath} 到 ${targetPath}`);
  }
});

console.log('SQL文件复制完成'); 