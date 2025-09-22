const fs = require('fs');
const path = require('path');

// 递归复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // 复制文件并修复导入路径
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // 修复导入路径：使用 @ 别名
      content = content.replace(
        /from ['"]\.\.\/\.\.\/\.\.\/src\/services\//g,
        "from '@/src/services/"
      );
      
      content = content.replace(
        /from ['"]\.\.\/\.\.\/services\//g,
        "from '@/src/services/"
      );
      
      content = content.replace(
        /from ['"]\.\.\/\.\.\/\.\.\/src\/types\//g,
        "from '@/src/types/"
      );
      
      content = content.replace(
        /from ['"]\.\.\/\.\.\/types\//g,
        "from '@/src/types/"
      );
      
      content = content.replace(
        /from ['"]\.\.\/\.\.\/\.\.\/lib\//g,
        "from '@/lib/"
      );
      
      content = content.replace(
        /from ['"]\.\.\/\.\.\/lib\//g,
        "from '@/lib/"
      );
      
      fs.writeFileSync(destPath, content);
    }
  }
}

// 同步 src/api 到 app/api
const srcApiDir = path.join(__dirname, '../src/api');
const appApiDir = path.join(__dirname, '../app/api');

console.log('🔄 同步 API 路由从 src/api 到 app/api...');
copyDir(srcApiDir, appApiDir);
console.log('✅ API 路由同步完成！');
