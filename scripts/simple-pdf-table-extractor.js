const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const pdf2pic = require('pdf2pic');

// 确保表格图片目录存在
const TABLE_IMAGES_DIR = path.join(__dirname, '../public/table-images');
if (!fs.existsSync(TABLE_IMAGES_DIR)) {
  fs.mkdirSync(TABLE_IMAGES_DIR, { recursive: true });
}

// 简单的PDF表格提取器 - 直接转换PDF页面为图片
async function extractTablesFromPDF(pdfFilePath, companyName) {
  console.log(`📊 开始处理 ${companyName} 的PDF表格...`);
  
  try {
    // 使用pdf2pic将PDF转换为图片
    const convert = pdf2pic.fromPath(pdfFilePath, {
      density: 200,           // 提高分辨率
      saveFilename: companyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
      savePath: TABLE_IMAGES_DIR,
      format: "png",
      width: 1200,            // 固定宽度
      height: 1600            // 固定高度
    });

    // 转换所有页面
    const results = await convert.bulk(-1, {
      responseType: "image"
    });

    console.log(`📊 成功转换 ${results.length} 页PDF为图片`);

    // 为每个页面创建表格对象
    const tables = [];
    results.forEach((result, index) => {
      if (result.path) {
        const tableName = `${companyName} Table ${index + 1}`;
        const imagePath = `/table-images/${path.basename(result.path)}`;
        
        tables.push({
          title: tableName,
          type: 'image',
          imagePath: imagePath,
          section: getSectionByPageIndex(index),
          isRealData: true,
          pageNumber: index + 1
        });
        
        console.log(`✅ 生成表格图片: ${tableName} - ${imagePath}`);
      }
    });

    return tables;

  } catch (error) {
    console.error(`❌ 处理 ${companyName} PDF时发生错误:`, error);
    return [];
  }
}

// 根据页面索引确定章节
function getSectionByPageIndex(pageIndex) {
  if (pageIndex < 3) return '1. 基本面分析';
  if (pageIndex < 6) return '2. 业务分析';
  if (pageIndex < 9) return '3. 增长催化剂';
  return '4. 估值分析';
}

// 处理所有PDF文件
async function processAllPDFs() {
  const referenceReportsDir = path.join(__dirname, '../reference-reports');
  const pdfFiles = fs.readdirSync(referenceReportsDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`🚀 开始处理 ${pdfFiles.length} 个PDF文件...`);
  
  const allReports = [];
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(referenceReportsDir, pdfFile);
    const companyName = pdfFile.split(' - ')[0].replace(/ \(.*\)/, '');
    
    console.log(`\n📄 处理文件: ${pdfFile}`);
    
    try {
      // 提取表格
      const tables = await extractTablesFromPDF(pdfPath, companyName);
      
      // 创建报告对象
      const report = {
        id: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-2025-10-04',
        title: `${companyName} - In-Depth Company Profile`,
        company: companyName,
        symbol: extractSymbol(pdfFile),
        date: '2025-10-04',
        summary: `Comprehensive analysis of ${companyName}, extracted from PDF with complete table data.`,
        pdfPath: pdfFile,
        isPublic: true,
        tables: tables,
        sections: {
          '1. 基本面分析': `Fundamental analysis content for ${companyName}`,
          '2. 业务分析': `Business analysis content for ${companyName}`,
          '3. 增长催化剂': `Growth catalysts content for ${companyName}`,
          '4. 估值分析': `Valuation analysis content for ${companyName}`
        }
      };
      
      allReports.push(report);
      console.log(`✅ 完成处理: ${companyName} - 生成了 ${tables.length} 个表格`);
      
    } catch (error) {
      console.error(`❌ 处理 ${pdfFile} 时发生错误:`, error);
    }
  }
  
  // 保存到JSON文件
  const outputPath = path.join(__dirname, '../data/historical-reports.json');
  fs.writeFileSync(outputPath, JSON.stringify(allReports, null, 2));
  
  console.log(`\n🎉 所有PDF处理完成！`);
  console.log(`📊 总报告数: ${allReports.length}`);
  console.log(`📁 保存到: ${outputPath}`);
  
  return allReports;
}

// 从文件名提取股票符号
function extractSymbol(filename) {
  const match = filename.match(/\(([^)]+)\)/);
  return match ? match[1] : 'N/A';
}

// 运行脚本
if (require.main === module) {
  processAllPDFs().catch(console.error);
}

module.exports = { extractTablesFromPDF, processAllPDFs };
