const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function debugTablePatterns() {
  const pdfPath = path.join(__dirname, '../reference-reports/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log('📄 PDF解析完成，开始调试表格模式...');
    
    // 查找包含表格特征的具体行
    const lines = pdfData.text.split('\n');
    
    console.log('\n🔍 查找包含表格特征的行...');
    
    // 查找包含Market Capitalization的行
    const marketCapLines = lines.filter(line => line.includes('Market Capitalization'));
    console.log('\n📊 Market Capitalization 行:');
    marketCapLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含Performance Metrics的行
    const performanceLines = lines.filter(line => line.includes('Performance Metrics'));
    console.log('\n📊 Performance Metrics 行:');
    performanceLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含Trading & Custody Metrics的行
    const tradingLines = lines.filter(line => line.includes('Trading & Custody Metrics'));
    console.log('\n📊 Trading & Custody Metrics 行:');
    tradingLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含Stablecoin & AI Metrics的行
    const stablecoinLines = lines.filter(line => line.includes('Stablecoin & AI Metrics'));
    console.log('\n📊 Stablecoin & AI Metrics 行:');
    stablecoinLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含Regional Distribution的行
    const regionalLines = lines.filter(line => line.includes('Regional Distribution'));
    console.log('\n📊 Regional Distribution 行:');
    regionalLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含DCF Key Assumptions的行
    const dcfLines = lines.filter(line => line.includes('DCF Key Assumptions'));
    console.log('\n📊 DCF Key Assumptions 行:');
    dcfLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // 查找包含具体数字的行
    console.log('\n🔍 查找包含具体数字的行...');
    const numberLines = lines.filter(line => 
      /\$[\d,]+(?:\.\d+)?[BMK]?/.test(line) && 
      line.length > 10 && line.length < 200
    );
    
    console.log(`\n📊 找到 ${numberLines.length} 个包含数字的行:`);
    numberLines.slice(0, 20).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugTablePatterns();
