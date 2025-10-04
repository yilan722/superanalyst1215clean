const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function analyzePDFTables() {
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成，总页数:', pdfData.numpages);
    console.log('📄 文本长度:', pdfData.text.length);
    
    // 查找包含表格特征的内容
    const lines = pdfData.text.split('\n');
    
    console.log('\n🔍 查找表格相关内容...');
    
    // 查找包含数字和财务数据的行
    const tableLines = lines.filter(line => {
      return /\d+|\$|%|Revenue|Income|Margin|ROE|ROA|P\/E|P\/B|Growth|Segment|Q[1-4]|Quarter|Year|202[0-9]|Million|Billion|Trillion/.test(line) &&
             line.length > 10 && line.length < 500;
    });
    
    console.log(`\n📊 找到 ${tableLines.length} 个可能的表格行:`);
    tableLines.slice(0, 20).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找特定的表格模式
    console.log('\n🔍 查找特定表格模式...');
    
    // 查找财务指标表格
    const financialPattern = /(?:Revenue|收入|Net Income|净利润|Operating Margin|营业利润率|ROE|ROA|P\/E|P\/B|Debt|债务|Margin|利润率|Growth|增长)[\s\S]*?(?=(?:Business|业务|Segment|部门|Growth|增长|Valuation|估值|$))/gi;
    const financialMatches = pdfData.text.match(financialPattern);
    
    if (financialMatches) {
      console.log('\n📊 财务指标表格内容:');
      financialMatches.forEach((match, index) => {
        console.log(`\n财务表格 ${index + 1}:`);
        console.log(match.substring(0, 500) + '...');
      });
    }
    
    // 查找业务部门表格
    const segmentPattern = /(?:Segment|部门|业务部门|Business Segment|Revenue by|收入按|Revenue Breakdown|收入分解)[\s\S]*?(?=(?:Growth|增长|Catalyst|催化剂|Valuation|估值|$))/gi;
    const segmentMatches = pdfData.text.match(segmentPattern);
    
    if (segmentMatches) {
      console.log('\n📊 业务部门表格内容:');
      segmentMatches.forEach((match, index) => {
        console.log(`\n业务表格 ${index + 1}:`);
        console.log(match.substring(0, 500) + '...');
      });
    }
    
    // 查找包含具体数字的段落
    console.log('\n🔍 查找包含具体数字的段落...');
    const numberPattern = /\$[\d,]+(?:\.\d+)?[BMK]?[\s\S]*?(?=\n\n|$)/g;
    const numberMatches = pdfData.text.match(numberPattern);
    
    if (numberMatches) {
      console.log('\n📊 包含数字的段落:');
      numberMatches.slice(0, 10).forEach((match, index) => {
        console.log(`\n数字段落 ${index + 1}:`);
        console.log(match);
      });
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
}

analyzePDFTables();
