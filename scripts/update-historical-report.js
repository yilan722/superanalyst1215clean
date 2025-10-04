#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('使用方法: node update-historical-report.js <报告ID> <PDF文件名>');
  console.log('示例: node update-historical-report.js pfe-2025-01-16 "Pfizer Inc. (PFE) - In-Depth Company Profile.pdf"');
  process.exit(1);
}

const [reportId, pdfFileName] = args;

// 文件路径
const reportsDir = path.join(__dirname, '..', 'reference-reports');
const historicalReportsPath = path.join(reportsDir, 'historical-reports.json');
const pdfPath = path.join(reportsDir, pdfFileName);

// PDF 解析函数
async function parsePDFContent(pdfPath) {
  try {
    console.log(`📄 开始解析PDF: ${pdfPath}`);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    console.log(`✅ PDF解析完成，共 ${data.numpages} 页，${data.text.length} 字符`);
    
    // 提取四个主要部分
    const sections = extractSectionsFromText(data.text, 'Pfizer Inc.');
    
    return {
      fullText: data.text,
      sections: sections,
      numPages: data.numpages
    };
  } catch (error) {
    console.error('❌ PDF解析失败:', error.message);
    return null;
  }
}

// 从文本中提取四个主要部分
function extractSectionsFromText(text, companyName) {
  const sections = {};
  
  // 定义四个部分的模式
  const sectionPatterns = [
    {
      key: '1. 基本面分析',
      patterns: [
        /1\.\s*基本面分析[：:]\s*(.*?)(?=2\.|$)/is,
        /1\.\s*Fundamental\s*Analysis[：:]\s*(.*?)(?=2\.|$)/is,
        /基本面分析[：:]\s*(.*?)(?=业务|增长|估值|$)/is,
        /Fundamental\s*Analysis[：:]\s*(.*?)(?=Business|Growth|Valuation|$)/is
      ]
    },
    {
      key: '2. 业务分析',
      patterns: [
        /2\.\s*业务分析[：:]\s*(.*?)(?=3\.|$)/is,
        /2\.\s*Business\s*Segments?\s*Analysis[：:]\s*(.*?)(?=3\.|$)/is,
        /业务分析[：:]\s*(.*?)(?=增长|估值|$)/is,
        /Business\s*Segments?\s*Analysis[：:]\s*(.*?)(?=Growth|Valuation|$)/is
      ]
    },
    {
      key: '3. 增长催化剂',
      patterns: [
        /3\.\s*增长催化剂[：:]\s*(.*?)(?=4\.|$)/is,
        /3\.\s*Growth\s*Catalysts?[：:]\s*(.*?)(?=4\.|$)/is,
        /增长催化剂[：:]\s*(.*?)(?=估值|$)/is,
        /Growth\s*Catalysts?[：:]\s*(.*?)(?=Valuation|$)/is
      ]
    },
    {
      key: '4. 估值分析',
      patterns: [
        /4\.\s*估值分析[：:]\s*(.*?)(?=5\.|$)/is,
        /4\.\s*Valuation\s*Analysis[：:]\s*(.*?)(?=5\.|$)/is,
        /估值分析[：:]\s*(.*?)(?=$)/is,
        /Valuation\s*Analysis[：:]\s*(.*?)(?=$)/is
      ]
    }
  ];
  
  // 尝试匹配每个部分
  sectionPatterns.forEach(section => {
    let content = '';
    
    for (const pattern of section.patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        content = match[1].trim();
        break;
      }
    }
    
    // 如果没有找到匹配，尝试从文本中提取相关内容
    if (!content) {
      content = extractContentByKeywords(text, section.key, companyName);
    }
    
    sections[section.key] = content || `基于${companyName}的${section.key}内容将在此处显示。`;
  });
  
  return sections;
}

// 通过关键词提取内容
function extractContentByKeywords(text, sectionType, companyName) {
  const keywords = {
    '1. 基本面分析': ['基本面', 'fundamental', '财务', 'financial', '业绩', 'performance'],
    '2. 业务分析': ['业务', 'business', '板块', 'segment', '运营', 'operation'],
    '3. 增长催化剂': ['增长', 'growth', '催化剂', 'catalyst', '机会', 'opportunity'],
    '4. 估值分析': ['估值', 'valuation', '价值', 'value', '价格', 'price', '目标价', 'target']
  };
  
  const sectionKeywords = keywords[sectionType] || [];
  const sentences = text.split(/[.!?。！？]/);
  
  let relevantSentences = [];
  sentences.forEach(sentence => {
    if (sentence.includes(companyName) || sectionKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    )) {
      relevantSentences.push(sentence.trim());
    }
  });
  
  return relevantSentences.slice(0, 5).join('. ') + '.';
}

// 主函数
async function main() {
  try {
    // 检查PDF文件是否存在
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ PDF文件不存在: ${pdfPath}`);
      process.exit(1);
    }

    // 读取历史报告文件
    if (!fs.existsSync(historicalReportsPath)) {
      console.error(`❌ 历史报告文件不存在: ${historicalReportsPath}`);
      process.exit(1);
    }

    const historicalData = JSON.parse(fs.readFileSync(historicalReportsPath, 'utf-8'));
    const reports = historicalData.reports || historicalData || [];

    // 查找要更新的报告
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      console.error(`❌ 报告不存在: ${reportId}`);
      process.exit(1);
    }

    console.log(`🔍 找到报告: ${reports[reportIndex].title}`);

    // 解析PDF内容
    console.log('🔍 开始解析PDF内容...');
    const pdfContent = await parsePDFContent(pdfPath);

    if (pdfContent) {
      // 更新报告内容
      reports[reportIndex].sections = pdfContent.sections;
      
      // 更新英文翻译
      if (reports[reportIndex].translations && reports[reportIndex].translations.en) {
        reports[reportIndex].translations.en.sections = {
          "1. Fundamental Analysis": pdfContent.sections["1. 基本面分析"],
          "2. Business Segments Analysis": pdfContent.sections["2. 业务分析"],
          "3. Growth Catalysts and Strategic Initiatives": pdfContent.sections["3. 增长催化剂"],
          "4. Valuation Analysis and Key Findings": pdfContent.sections["4. 估值分析"]
        };
      }

      console.log('✅ 报告内容已更新');
      console.log(`📊 PDF解析结果:`);
      console.log(`   - 页数: ${pdfContent.numPages}`);
      console.log(`   - 字符数: ${pdfContent.fullText.length}`);
      console.log(`   - 解析的章节: ${Object.keys(pdfContent.sections).join(', ')}`);
    } else {
      console.log('⚠️ PDF解析失败，保持原有内容');
    }

    // 保存更新后的历史报告
    const updatedData = { reports: reports };
    fs.writeFileSync(historicalReportsPath, JSON.stringify(updatedData, null, 2));

    console.log('✅ 历史报告文件已更新');

  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
