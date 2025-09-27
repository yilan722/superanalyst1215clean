const fs = require('fs')
const path = require('path')

// 需要添加 runtime 配置的 API 路由
const apiRoutes = [
  'app/api/generate-report-perplexity/route.ts',
  'app/api/recalculate-dcf/route.ts',
  'app/api/stripe/create-checkout-session/route.ts',
  'app/api/insight-refinery/ask-question/route.ts',
  'app/api/insight-refinery/hub/[userId]/route.ts',
  'app/api/insight-refinery/synthesize-insights/route.ts',
  'app/api/insight-refinery/generate-evolution/route.ts',
  'app/api/insight-refinery/compare-versions/route.ts',
  'app/api/reports/route.ts',
  'app/api/reports/[reportId]/route.ts',
  'app/api/manual-subscription-update/route.ts',
  'app/api/debug-webhook/route.ts'
]

function addRuntimeConfig(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 文件不存在: ${filePath}`)
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')
    
    // 检查是否已经有 runtime 配置
    if (content.includes('export const runtime')) {
      console.log(`✅ 已有 runtime 配置: ${filePath}`)
      return
    }

    // 在文件开头添加 runtime 配置
    const lines = content.split('\n')
    let insertIndex = 0
    
    // 找到第一个 import 语句的位置
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i
        break
      }
    }

    // 在第一个 import 之前插入 runtime 配置
    lines.splice(insertIndex, 0, '')
    lines.splice(insertIndex + 1, 0, '// 使用 Node.js runtime 以避免 Edge Runtime 兼容性问题')
    lines.splice(insertIndex + 2, 0, 'export const runtime = "nodejs"')
    lines.splice(insertIndex + 3, 0, '')

    const newContent = lines.join('\n')
    fs.writeFileSync(filePath, newContent)
    console.log(`✅ 已添加 runtime 配置: ${filePath}`)

  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message)
  }
}

console.log('🔧 开始修复 Edge Runtime 兼容性问题...')

apiRoutes.forEach(route => {
  addRuntimeConfig(route)
})

console.log('\n🎯 修复完成！')
console.log('现在所有使用 Supabase 的 API 路由都使用 Node.js runtime')
console.log('这应该解决 Edge Runtime 兼容性问题')
