# Vercel 部署指南

本指南将帮助您将 SuperAnalystPro 部署到 Vercel。

## 📋 前置要求

1. GitHub 账号
2. Vercel 账号（可通过 GitHub 登录）
3. 所有必要的 API 密钥

## 🚀 部署步骤

### 步骤 1: 上传代码到 GitHub

1. **初始化 Git 仓库（如果还没有）**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Fix Supabase client issues"
   ```

2. **连接到 GitHub 仓库**
   ```bash
   git remote add origin https://github.com/yilan722/superanalyst1215clean.git
   git branch -M main
   git push -u origin main
   ```

   如果仓库已存在，可能需要先拉取：
   ```bash
   git pull origin main --allow-unrelated-histories
   git push -u origin main
   ```

### 步骤 2: 在 Vercel 上部署

#### 方法 A: 通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `yilan722/superanalyst1215clean` 仓库
   - 点击 "Import"

3. **配置项目设置**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）

4. **配置环境变量**
   在 "Environment Variables" 部分添加以下变量：

   **必需的环境变量：**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   TUSHARE_TOKEN=your_tushare_token
   ```

   **可选的环境变量：**
   ```env
   OPUS4_API_KEY=your_nuwa_api_key
   QWEN_API_KEY=your_qwen_api_key
   QWEN_API_URL=https://api.nuwaapi.com/v1/chat/completions
   QWEN_MODEL=gemini-3-pro-preview
   PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
   SONAR_MODEL=sonar
   MAX_SONAR_QUERIES=8
   QUERY_PLANNER_MAX_TOKENS=500
   DEEP_ANALYSIS_MAX_TOKENS=16000
   MAX_CONCURRENT_SEARCHES=5
   API_TIMEOUT=300
   MAX_RETRIES=3
   ENABLE_CACHE=true
   CACHE_EXPIRY_HOURS=6
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HS935K4G8C
   ```

   **重要提示：**
   - 确保所有 `NEXT_PUBLIC_*` 变量都已设置
   - 为 Production、Preview 和 Development 环境分别设置变量
   - 点击每个变量旁边的三个点，选择要应用的环境

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 2-5 分钟）

#### 方法 B: 使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add PERPLEXITY_API_KEY
   vercel env add TUSHARE_TOKEN
   # ... 添加其他环境变量
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

### 步骤 3: 验证部署

1. **检查构建日志**
   - 在 Vercel Dashboard 中查看构建日志
   - 确保没有错误

2. **测试应用**
   - 访问您的 Vercel URL（例如：`https://superanalyst1215clean.vercel.app`）
   - 测试登录功能
   - 测试报告生成功能

3. **检查环境变量**
   - 确保所有环境变量都已正确设置
   - 检查浏览器控制台是否有错误

## 🔧 故障排除

### 问题 1: "Multiple GoTrueClient instances" 警告

**解决方案：** 已修复！确保使用 `app/services/database/supabase-client.ts` 而不是旧的 `app/services/supabase.ts`。

### 问题 2: "Failed to execute 'fetch' on 'Window': Invalid value" 错误

**解决方案：** 已修复！确保在 Vercel 环境变量中设置了：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 问题 3: 构建失败

**可能原因：**
- 缺少依赖
- TypeScript 错误
- 环境变量未设置

**解决方案：**
1. 检查构建日志中的错误信息
2. 确保所有依赖都已安装：`npm install`
3. 检查 TypeScript 错误：`npm run lint`
4. 确保所有必需的环境变量都已设置

### 问题 4: API 路由超时

**解决方案：** `vercel.json` 已配置了超时设置：
- `generate-report-perplexity`: 800秒
- `generate-report-external`: 300秒
- `recalculate-dcf`: 300秒

如果使用 Vercel Pro，这些设置会自动应用。

## 📝 环境变量说明

### 必需变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | Supabase Dashboard → Settings → API |
| `PERPLEXITY_API_KEY` | Perplexity API 密钥 | [Perplexity API](https://www.perplexity.ai/) |
| `TUSHARE_TOKEN` | Tushare API Token | [Tushare](https://tushare.pro/) |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPUS4_API_KEY` | Nuwa API 密钥 | - |
| `QWEN_API_KEY` | Qwen API 密钥 | - |
| `MAX_SONAR_QUERIES` | Sonar 查询最大次数 | 8 |
| `API_TIMEOUT` | API 超时时间（秒） | 300 |

## 🔄 更新部署

每次推送到 GitHub 的 `main` 分支时，Vercel 会自动重新部署。

手动触发部署：
1. 在 Vercel Dashboard 中点击 "Redeploy"
2. 或使用 CLI：`vercel --prod`

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 所有必需的环境变量已设置
- [ ] 构建成功完成
- [ ] 应用可以正常访问
- [ ] 登录功能正常
- [ ] 报告生成功能正常
- [ ] 没有控制台错误

## 🎉 完成！

部署完成后，您的应用将在 Vercel 上运行。如果遇到任何问题，请检查：
1. Vercel 构建日志
2. 浏览器控制台
3. 网络请求（Network tab）

祝部署顺利！

