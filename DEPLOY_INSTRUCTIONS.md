# 🚀 部署到 Vercel 的完整指南

## ✅ 已完成的工作

1. ✅ 修复了 Supabase 客户端多实例问题
2. ✅ 添加了环境变量验证和默认值
3. ✅ 统一使用 `supabase-client.ts` 作为客户端实例
4. ✅ 初始化了 Git 仓库并提交了所有代码

## 📤 步骤 1: 推送到 GitHub

在终端中执行以下命令：

```bash
cd /Users/yilan/Desktop/superanalyst1215clean-main

# 检查远程仓库配置
git remote -v

# 如果还没有设置远程仓库，执行：
git remote add origin https://github.com/yilan722/superanalyst1215clean.git

# 推送到 GitHub（如果是第一次推送）
git push -u origin main
```

**如果遇到权限问题：**
- 确保您已经登录 GitHub
- 如果使用 HTTPS，可能需要输入 GitHub 用户名和 Personal Access Token
- 或者使用 SSH：`git remote set-url origin git@github.com:yilan722/superanalyst1215clean.git`

## 🌐 步骤 2: 在 Vercel 上部署

### 方法 A: 通过 Vercel Dashboard（推荐）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 在 "Import Git Repository" 中搜索 `superanalyst1215clean`
   - 选择 `yilan722/superanalyst1215clean`
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: **Next.js**（自动检测）✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
   - Install Command: `npm install` ✅

4. **设置环境变量**（非常重要！）

   在 "Environment Variables" 部分，点击 "Add" 添加以下变量：

   **必需的环境变量：**
   
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   PERPLEXITY_API_KEY
   TUSHARE_TOKEN
   ```

   **可选但推荐的环境变量：**
   
   ```
   OPUS4_API_KEY
   QWEN_API_KEY
   QWEN_API_URL=https://api.nuwaapi.com/v1/chat/completions
   QWEN_MODEL=gemini-3-pro-preview
   PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
   SONAR_MODEL=sonar
   ```

   **重要提示：**
   - 为每个变量选择应用环境：Production、Preview、Development
   - 确保所有 `NEXT_PUBLIC_*` 变量都已设置
   - 点击每个变量旁边的三个点（⋯）来选择环境

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常 2-5 分钟）
   - 构建成功后，您会获得一个 URL（例如：`https://superanalyst1215clean.vercel.app`）

### 方法 B: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目目录中部署
cd /Users/yilan/Desktop/superanalyst1215clean-main
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PERPLEXITY_API_KEY
vercel env add TUSHARE_TOKEN

# 生产环境部署
vercel --prod
```

## 🔍 步骤 3: 验证部署

1. **检查构建日志**
   - 在 Vercel Dashboard 中查看构建日志
   - 确保没有错误

2. **测试应用**
   - 访问您的 Vercel URL
   - 测试登录功能
   - 测试报告生成功能
   - 检查浏览器控制台是否有错误

3. **验证修复**
   - 应该不再看到 "Multiple GoTrueClient instances" 警告
   - 应该不再看到 "Invalid value" 错误
   - 登录功能应该正常工作

## 🐛 常见问题

### 问题 1: 推送被拒绝

**解决方案：**
```bash
# 如果远程仓库已有内容，先拉取
git pull origin main --allow-unrelated-histories

# 然后推送
git push -u origin main
```

### 问题 2: 构建失败

**检查：**
- 所有环境变量是否已设置
- 构建日志中的具体错误信息
- 确保 `package.json` 中的依赖都正确

### 问题 3: 环境变量未生效

**解决方案：**
- 确保变量名正确（区分大小写）
- 确保为 Production 环境设置了变量
- 重新部署项目

## 📝 环境变量清单

在 Vercel 中设置以下环境变量：

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PERPLEXITY_API_KEY`
- [ ] `TUSHARE_TOKEN`
- [ ] `OPUS4_API_KEY` (可选)
- [ ] `QWEN_API_KEY` (可选)
- [ ] `QWEN_API_URL` (可选)
- [ ] `QWEN_MODEL` (可选)
- [ ] `PERPLEXITY_API_URL` (可选)
- [ ] `SONAR_MODEL` (可选)

## 🎉 完成！

部署完成后，您的应用将在 Vercel 上运行。每次推送到 GitHub 的 `main` 分支时，Vercel 会自动重新部署。

## 📚 相关文档

- 详细部署指南：`docs/VERCEL_DEPLOYMENT_GUIDE.md`
- Supabase 设置：`docs/SUPABASE_SETUP.md`
- 环境变量配置：`docs/ENV_CONFIG.md`

祝部署顺利！🚀

