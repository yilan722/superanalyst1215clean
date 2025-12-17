# Vercel 环境变量检查指南

## 🔍 问题诊断

如果遇到 "Failed to execute 'fetch' on 'Window': Invalid value" 错误，通常是因为：

1. **环境变量未在 Vercel 中设置**
2. **环境变量值格式不正确**
3. **环境变量设置了但未应用到正确的环境（Production/Preview/Development）**

## ✅ 检查步骤

### 方法 1: 使用检查 API（推荐）

部署后，访问以下 URL 检查环境变量：

```
https://your-app.vercel.app/api/check-supabase-env
```

这会返回：
- 环境变量是否存在
- 环境变量格式是否正确
- 详细的诊断信息

### 方法 2: 在 Vercel Dashboard 中检查

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 检查以下变量是否已设置：

**必需变量：**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PERPLEXITY_API_KEY`
- `TUSHARE_TOKEN`

### 方法 3: 检查浏览器控制台

打开浏览器开发者工具（F12），查看控制台：

- ✅ 如果看到 `✅ Supabase client created successfully`，说明配置正确
- ❌ 如果看到 `❌ Invalid Supabase URL` 或 `❌ Invalid Supabase Anon Key format`，说明环境变量有问题

## 🔧 修复步骤

### 步骤 1: 在 Vercel 中设置环境变量

1. 进入 Vercel Dashboard → 您的项目 → **Settings** → **Environment Variables**
2. 点击 **Add** 添加每个变量
3. **重要**：为每个变量选择应用环境：
   - ✅ Production（生产环境）
   - ✅ Preview（预览环境）
   - ✅ Development（开发环境）

### 步骤 2: 重新部署

设置环境变量后，需要重新部署：

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 找到最新的部署，点击 **⋯** → **Redeploy**
3. 或者推送新的代码到 GitHub（会自动触发部署）

### 步骤 3: 验证修复

部署完成后：

1. 访问 `https://your-app.vercel.app/api/check-supabase-env`
2. 检查返回的 JSON，确保 `status` 为 `"ok"`
3. 尝试登录，应该不再出现 "Invalid value" 错误

## 📝 环境变量格式要求

### NEXT_PUBLIC_SUPABASE_URL
- 格式：`https://xxxxx.supabase.co`
- 示例：`https://decmecsshjqymhkykazg.supabase.co`
- 必须是以 `https://` 开头的有效 URL

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- 格式：JWT token（包含点号 `.`）
- 长度：通常 > 100 字符
- 示例：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚠️ 常见错误

### 错误 1: 环境变量设置了但未生效

**原因**：只设置了 Development 环境，但访问的是 Production

**解决**：确保为 **Production** 环境也设置了变量

### 错误 2: 环境变量值有空格

**原因**：复制粘贴时包含了前后空格

**解决**：检查并删除前后空格

### 错误 3: 变量名拼写错误

**原因**：变量名大小写错误或拼写错误

**解决**：确保变量名完全正确：
- `NEXT_PUBLIC_SUPABASE_URL`（不是 `SUPABASE_URL`）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（不是 `SUPABASE_ANON_KEY`）

## 🎯 快速检查清单

- [ ] 在 Vercel Dashboard 中设置了所有必需的环境变量
- [ ] 为 Production 环境设置了变量
- [ ] 变量值格式正确（URL 和 JWT token）
- [ ] 重新部署了应用
- [ ] 访问 `/api/check-supabase-env` 返回 `status: "ok"`
- [ ] 浏览器控制台没有 Supabase 相关错误

## 📞 需要帮助？

如果问题仍然存在：

1. 检查 Vercel 构建日志，查看是否有错误
2. 访问 `/api/check-supabase-env` 查看详细诊断
3. 检查浏览器控制台的完整错误信息
4. 确保 Supabase 项目正常运行

