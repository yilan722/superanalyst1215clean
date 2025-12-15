/**
 * 报告格式化器 - 将Markdown报告转换为HTML格式
 * 保持原有的CSS类名和视觉格式
 */

interface ReportJson {
  fundamentalAnalysis?: string
  businessSegments?: string
  growthCatalysts?: string
  valuationAnalysis?: string
  aiInsights?: string
}

/**
 * 将Markdown报告JSON转换为HTML格式
 */
export function convertMarkdownToHtml(reportJson: ReportJson): Record<string, string> {
  const htmlReport: Record<string, string> = {}

  for (const [key, markdownContent] of Object.entries(reportJson)) {
    if (markdownContent) {
      htmlReport[key] = convertSectionToHtml(markdownContent)
    }
  }

  return htmlReport
}

/**
 * 将单个Markdown章节转换为HTML
 */
function convertSectionToHtml(markdown: string): string {
  if (!markdown) return ''

  let html = markdown

  // 1. 转换Markdown表格为HTML表格（保持metric-table类）
  // 这是第一步，确保所有表格都被转换
  // 多次转换以确保所有表格都被处理（有些表格可能跨多行）
  let previousHtml = ''
  let iterationCount = 0
  while (html !== previousHtml && iterationCount < 5) {
    previousHtml = html
    html = convertMarkdownTablesToHtml(html)
    iterationCount++
  }
  
  // 验证转换结果：检查是否还有未转换的Markdown表格标记
  const remainingTableMarkers = html.match(/\|\s*:?-+\s*\|/g)
  if (remainingTableMarkers && remainingTableMarkers.length > 0) {
    console.warn(`⚠️ 警告：检测到 ${remainingTableMarkers.length} 个可能未转换的表格分隔符`)
    // 尝试再次转换
    html = convertMarkdownTablesToHtml(html)
  }
  
  // 验证HTML表格数量
  const htmlTableCount = (html.match(/<table class="metric-table">/g) || []).length
  if (htmlTableCount > 0) {
    console.log(`✅ 确认：已生成 ${htmlTableCount} 个HTML表格`)
  }
  
  // 删除重复的"Investment Risk-Return Profile"内容
  html = removeDuplicateRiskReturnProfile(html)

  // 2. 转换标题格式
  html = convertHeadings(html)

  // 3. 转换段落和换行
  html = convertParagraphs(html)

  // 4. 转换强调文本（但不在表格中）
  html = convertEmphasis(html)

  // 5. 转换列表
  html = convertLists(html)

  // 6. 清理多余的空行
  html = cleanExtraWhitespace(html)

  return html
}

/**
 * 转换Markdown表格为HTML表格
 * 格式: | Header1 | Header2 | ... |
 *       | --- | --- | --- |
 *       | Data1 | Data2 | ... |
 */
function convertMarkdownTablesToHtml(markdown: string): string {
  // 改进的表格匹配：匹配完整的表格块
  // 匹配模式：以|开头的行，然后是分隔行（包含---、:--、:---等），然后是数据行
  // 使用更宽松的匹配，允许表格前后有空行
  // 匹配格式：
  //   | Header | Header | 
  //   | :-- | :-- |  (左对齐)
  //   | --- | --- |  (默认对齐)
  //   | :--- | :--- | (左对齐)
  // 注意：分隔行可以包含 : 和 - 的任意组合，可能有多列用 || 分隔
  // 改进正则：更宽松地匹配表格，包括多列分隔符 ||
  const tableRegex = /(\n|^)(\|[^\n]+\|\s*\n\|[\s\-:|]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/gm

  let conversionCount = 0
  
  const result = markdown.replace(tableRegex, (match, prefix) => {
    // 提取表格内容（去掉前缀）
    const tableContent = match.replace(/^(\n|^)/, '')
    const lines = tableContent.trim().split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed && trimmed.includes('|')
    })
    
    if (lines.length < 2) {
      console.warn('⚠️ 表格行数不足，跳过转换:', lines.length)
      return match // 至少需要表头和一行数据
    }

    // 解析表头（第一行）
    const headerLine = lines[0]
    const headers = parseTableRow(headerLine)
    
    // 调试：输出表头信息
    if (headers.length === 0) {
      console.warn('⚠️ 表头解析失败，原始行:', headerLine)
    }

    // 跳过分隔行（第二行，包含---、:--、:---等）
    // 解析数据行（从第三行开始）
    const dataRows: string[][] = []
    for (let i = 2; i < lines.length; i++) {
      const row = parseTableRow(lines[i])
      if (row.length > 0) {
        dataRows.push(row)
      }
    }
    
    // 调试：如果数据行解析失败，输出详细信息
    if (dataRows.length === 0 && lines.length > 2) {
      console.warn('⚠️ 数据行解析失败，原始行数:', lines.length)
      console.warn('⚠️ 前3行内容:', lines.slice(0, 3))
    }

    if (headers.length === 0 || dataRows.length === 0) {
      console.warn('⚠️ 表格解析失败 - 表头数:', headers.length, '数据行数:', dataRows.length)
      return match // 如果解析失败，返回原文本
    }
    
    conversionCount++
    console.log(`✅ 转换表格 #${conversionCount}: ${headers.length}列 x ${dataRows.length}行`)

    // 生成HTML表格（完全符合优必选报告格式，与CSS样式匹配）
    let htmlTable = '<table class="metric-table">\n<thead>\n<tr>\n'
    
    // 表头（左对齐，灰色背景）
    headers.forEach(header => {
      const cleanHeader = header.trim()
      htmlTable += `  <th>${escapeHtml(cleanHeader)}</th>\n`
    })
    
    htmlTable += '</tr>\n</thead>\n<tbody>\n'

    // 数据行（第一列左对齐，其他列右对齐）
    dataRows.forEach((row, rowIndex) => {
      htmlTable += '<tr>\n'
      // 确保行数据与表头列数一致
      const normalizedRow = [...row]
      while (normalizedRow.length < headers.length) {
        normalizedRow.push('')
      }
      normalizedRow.slice(0, headers.length).forEach((cell, cellIndex) => {
        const cleanCell = cell.trim()
        // 检测是否需要添加positive/negative类
        // 第一列通常是文本标签，不应用颜色类（CSS会自动左对齐）
        const cellHtml = formatTableCell(cleanCell, cellIndex, headers.length)
        htmlTable += `  <td>${cellHtml}</td>\n`
      })
      htmlTable += '</tr>\n'
    })

    htmlTable += '</tbody>\n</table>'

    // 02313报告格式：表格后只有一个换行，与后续段落自然衔接
    return prefix + htmlTable + '\n'
  })
  
  if (conversionCount > 0) {
    console.log(`✅ 共转换 ${conversionCount} 个Markdown表格为HTML格式`)
  } else {
    // 检查是否还有未转换的Markdown表格
    const remainingTables = markdown.match(/\|[^\n]+\|\s*\n\|[\s\-:]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+/g)
    if (remainingTables && remainingTables.length > 0) {
      console.warn(`⚠️ 检测到 ${remainingTables.length} 个未转换的Markdown表格`)
    }
  }
  
  return result
}

/**
 * 解析表格行
 * 支持单列分隔符 | 和双列分隔符 ||
 */
function parseTableRow(line: string): string[] {
  // 移除首尾的|
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return []
  }

  // 处理双列分隔符 || 的情况（先替换为单列，再分割）
  // 例如：| Metric || UBTECH || Xiaomi | 应该解析为 ["Metric", "", "UBTECH", "", "Xiaomi"]
  // 但更合理的做法是：| Metric | UBTECH | Xiaomi | 或 | Metric || UBTECH || Xiaomi |
  let processedLine = trimmed
  
  // 如果包含 ||，需要特殊处理
  // 将 || 替换为 | |（两个单元格，中间一个空单元格）
  processedLine = processedLine.replace(/\|\|/g, '| |')
  
  // 分割单元格（注意处理转义的|）
  const cells = processedLine
    .slice(1, -1) // 移除首尾的|
    .split('|')
    .map(cell => cell.trim())

  return cells
}

/**
 * 格式化表格单元格，检测positive/negative类
 * 支持LaTeX数学公式（如 $+8.2 \%$）和02313报告格式
 * @param cell 单元格内容
 * @param cellIndex 单元格索引（第一列通常是文本，不应用颜色）
 * @param totalColumns 总列数（用于判断最后一列）
 */
function formatTableCell(cell: string, cellIndex: number = 0, totalColumns: number = 0): string {
  // 第一列通常是文本标签，不应用颜色类
  if (cellIndex === 0) {
    return escapeHtml(cell)
  }
  
  // 处理LaTeX数学公式（如 $+8.2 \%$、$27.1 \%$）
  // 先提取LaTeX公式，然后检测正负数
  const latexRegex = /\$([^$]+)\$/g
  let processedCell = cell
  const latexMatches: string[] = []
  
  // 提取所有LaTeX公式
  processedCell = processedCell.replace(latexRegex, (match, content) => {
    latexMatches.push(content)
    return `__LATEX_${latexMatches.length - 1}__`
  })
  
  // 检测正数模式（匹配02313报告格式）
  // 匹配：+数字%、+8.2%、+数字bps、positive、增长、上升、提高、增加等
  // 特别注意：匹配LaTeX格式如 $+8.2 \%$ 和普通格式如 +8.2%
  const isPositive = /(\+[\d.,]+\s*%|\+[\d.,]+\s*\\?%|\+[\d.,]+\s*bps|\+[\d.,]+%?|positive|增长|上升|提高|增加|高于|优于|超出|提升|改善|narrowed|improved|increased)/i.test(cell) ||
                     /\+[\d.,]+\s*\\?%/.test(cell)
  
  // 检测负数模式
  // 匹配：-数字%、-12.9%、-数字bps、negative、下降、降低、减少等
  const isNegative = /(\-[\d.,]+\s*%|\-[\d.,]+\s*\\?%|\-[\d.,]+\s*bps|\-[\d.,]+%?|negative|下降|降低|减少|亏损|低于|劣于|下滑|恶化|负增长|declined|decreased|reduced)/i.test(cell) ||
                     /\-[\d.,]+\s*\\?%/.test(cell)
  
  // 检测中性模式
  const isNeutral = /(neutral|中性|持平|稳定|不变|维持|stable|maintained)/i.test(cell)
  
  // 恢复LaTeX公式并转义HTML
  let escaped = escapeHtml(cell)
  
  // 如果包含LaTeX公式，需要特殊处理
  if (latexMatches.length > 0) {
    // 将LaTeX公式转换为HTML格式（保持$符号用于后续渲染）
    escaped = escaped.replace(/\$([^$]+)\$/g, (match, content) => {
      const trimmed = content.trim()
      // 检测LaTeX公式中的正负数
      if (/(\+[\d.,]+\s*\\?%|\+[\d.,]+)/.test(trimmed)) {
        return `<span class="positive">$${trimmed}$</span>`
      } else if (/(\-[\d.,]+\s*\\?%|\-[\d.,]+)/.test(trimmed)) {
        return `<span class="negative">$${trimmed}$</span>`
      }
      return `$${trimmed}$`
    })
  }
  
  // 应用颜色类
  if (isPositive && !escaped.includes('class=')) {
    return `<span class="positive">${escaped}</span>`
  } else if (isNegative && !escaped.includes('class=')) {
    return `<span class="negative">${escaped}</span>`
  } else if (isNeutral && !escaped.includes('class=')) {
    return `<span class="neutral">${escaped}</span>`
  }

  return escaped
}

/**
 * 转换标题格式
 */
function convertHeadings(markdown: string): string {
  // 转换 ## 为 <h3>
  markdown = markdown.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>')
  
  // 转换 ### 为 <h4>
  markdown = markdown.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
  
  // 转换 #### 为 <h5>
  markdown = markdown.replace(/^####\s+(.+)$/gm, '<h5>$1</h5>')

  return markdown
}

/**
 * 转换段落和换行
 * 匹配02313报告格式：表格直接嵌入文字，无特殊解释标题
 */
function convertParagraphs(markdown: string): string {
  // 将双换行转换为段落
  // 但需要避免处理已经转换的HTML表格
  const paragraphs = markdown.split(/\n\s*\n/)
  
  return paragraphs.map(para => {
    const trimmed = para.trim()
    if (!trimmed) return ''
    
    // 如果已经是HTML标签（表格、标题等），不处理
    if (trimmed.startsWith('<table') || 
        trimmed.startsWith('<h') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<li')) {
      return trimmed
    }
    
    // 如果包含HTML标签，可能是混合内容，需要特殊处理
    if (trimmed.includes('<')) {
      // 对于包含HTML的内容，只包装纯文本部分
      return trimmed
    }
    
    // 02313报告格式：表格后直接跟文字，无"Interpretation"标题
    // 所有段落统一处理为普通段落
    
    // 否则转换为段落
    return `<p>${trimmed}</p>`
  }).join('\n\n')
}

/**
 * 转换强调文本（但不在表格中）
 */
function convertEmphasis(markdown: string): string {
  // 转换 **bold** 为 <strong>
  markdown = markdown.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // 转换 *italic* 为 <em>（但不在表格中）
  // 注意：表格中的内容已经在convertMarkdownTablesToHtml中处理了

  return markdown
}

/**
 * 转换列表
 */
function convertLists(markdown: string): string {
  // 转换无序列表
  markdown = markdown.replace(/^[\*\-\+]\s+(.+)$/gm, '<li>$1</li>')
  
  // 将连续的<li>包装在<ul>中
  markdown = markdown.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>\n' + match + '</ul>\n'
  })

  // 转换有序列表
  markdown = markdown.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
  
  // 将连续的有序列表项包装在<ol>中
  markdown = markdown.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // 检查是否应该用<ol>（如果前面有数字）
    return '<ol>\n' + match + '</ol>\n'
  })

  return markdown
}

/**
 * 清理多余的空行
 */
function cleanExtraWhitespace(html: string): string {
  // 移除3个或更多连续的空行
  html = html.replace(/\n{3,}/g, '\n\n')
  
  // 清理行尾空格
  html = html.replace(/[ \t]+$/gm, '')
  
  return html.trim()
}

/**
 * HTML转义
 * 保留LaTeX数学公式（$...$）不被转义
 */
function escapeHtml(text: string): string {
  // 先提取LaTeX公式
  const latexParts: string[] = []
  let processed = text.replace(/\$([^$]+)\$/g, (match, content) => {
    const index = latexParts.length
    latexParts.push(content)
    return `__LATEX_${index}__`
  })
  
  // 转义HTML特殊字符
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  processed = processed.replace(/[&<>"']/g, (m) => map[m])
  
  // 恢复LaTeX公式（$符号不需要转义）
  processed = processed.replace(/__LATEX_(\d+)__/g, (match, index) => {
    return `$${latexParts[parseInt(index)]}$`
  })
  
  return processed
}

/**
 * 删除重复的"Investment Risk-Return Profile"内容
 */
function removeDuplicateRiskReturnProfile(html: string): string {
  // 匹配Investment Risk-Return Profile的完整内容块
  const riskReturnPattern = /<div class="chart-container">\s*<h4>Investment Risk-Return Profile<\/h4>[\s\S]*?<\/div>\s*<\/div>/g
  const matches = html.match(riskReturnPattern)
  
  if (matches && matches.length > 1) {
    // 保留第一个，删除其余的
    console.log(`⚠️ 检测到 ${matches.length} 个重复的"Investment Risk-Return Profile"，删除重复项`)
    let result = html
    for (let i = 1; i < matches.length; i++) {
      result = result.replace(matches[i], '')
    }
    return result
  }
  
  return html
}

/**
 * 验证报告格式
 */
export function validateReportFormat(reportJson: ReportJson): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const requiredKeys = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']

  // 检查必需的键
  for (const key of requiredKeys) {
    if (!reportJson[key as keyof ReportJson]) {
      errors.push(`缺少必需的章节: ${key}`)
    }
  }

  // 检查每个章节是否有内容
  for (const [key, content] of Object.entries(reportJson)) {
    if (content && content.trim().length < 100) {
      errors.push(`章节 ${key} 内容过短`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

