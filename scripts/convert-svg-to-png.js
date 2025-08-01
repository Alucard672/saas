/**
 * SVG 转 PNG 批量转换脚本
 * 依赖：sharp, glob
 * 安装：npm install sharp glob
 * 使用：node scripts/convert-svg-to-png.js
 */
const sharp = require('sharp');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

async function convertSvgToPng() {
  try {
    console.log('开始扫描 SVG 文件...');
    
    // 使用新版本 glob 的 async 方式
    const files = await glob('images/*.svg');
    
    if (files.length === 0) {
      console.log('未找到 SVG 文件');
      return;
    }
    
    console.log(`找到 ${files.length} 个 SVG 文件`);
    
    for (const file of files) {
      try {
        const basename = path.basename(file, '.svg');
        const outFile = path.join(path.dirname(file), `${basename}.png`);
        
        // 检查 SVG 文件是否存在且有内容
        const svgContent = fs.readFileSync(file, 'utf8');
        if (svgContent.length < 50) {
          console.log(`跳过空文件: ${file}`);
          continue;
        }
        
        await sharp(Buffer.from(svgContent))
          .png({ quality: 100, compressionLevel: 0 })
          .resize(64, 64)
          .toFile(outFile);
          
        console.log(`✅ 已转换 ${file} -> ${outFile}`);
        
        // 验证生成的 PNG 文件
        const stats = fs.statSync(outFile);
        console.log(`   文件大小: ${stats.size} 字节`);
        
      } catch (error) {
        console.error(`❌ 转换失败 ${file}:`, error.message);
      }
    }
    
    console.log('转换完成！');
    
  } catch (error) {
    console.error('扫描文件失败:', error);
  }
}

// 执行转换
convertSvgToPng();
