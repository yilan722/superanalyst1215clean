const pdf = require('pdf-parse');
const fs = require('fs');

async function testPDFExtract() {
  try {
    const data = fs.readFileSync('/Users/yilanliu/Desktop/superanalyst/Posted report/Bakkt Holdings, Inc. (BKKT) - In-Depth Company Profile.pdf');
    const pdfData = await pdf(data);
    
    let cleanText = pdfData.text;
    cleanText = cleanText.replace(/([a-zA-Z])\s+([a-zA-Z])/g, '$1$2');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    console.log('查找章节标题:');
    const sections = cleanText.match(/\d+\.\s*[A-Za-z]+/g);
    console.log(sections);
    
    console.log('\n查找1. FundamentalAnalysisBakktHoldings:');
    const match = cleanText.match(/1\.\s*FundamentalAnalysisBakktHoldings(.*?)(?=2\.\s*BusinessSegmentsAnalysis|$)/gis);
    console.log('匹配结果:', match ? '找到' : '未找到');
    if (match && match[1]) {
      console.log('内容长度:', match[1].length);
      console.log('内容前200字符:', match[1].substring(0, 200));
    }
    
    console.log('\n查找2. BusinessSegmentsAnalysis:');
    const match2 = cleanText.match(/2\.\s*BusinessSegmentsAnalysis(.*?)(?=3\.\s*GrowthCatalystsandStrategicInitiatives|$)/gis);
    console.log('匹配结果:', match2 ? '找到' : '未找到');
    if (match2 && match2[1]) {
      console.log('内容长度:', match2[1].length);
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

testPDFExtract();
