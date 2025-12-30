# 部署后数据库查询失败问题修复

## 问题描述

部署到 Vercel 后，API 路由 `/api/generate-report-perplexity` 返回 404 错误，提示 "User not found"。

## 问题原因

1. **RLS (Row Level Security) 策略限制**：API 路由使用 `createApiSupabaseClient` 创建的 Supabase 客户端使用的是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（anon key），这个 key 受到 RLS 策略的限制。

2. **用户会话缺失**：在 API 路由中，虽然从 Authorization header 中提取了用户ID，但 Supabase 客户端可能没有正确的用户会话，导致 `auth.uid()` 返回 null，RLS 策略阻止了查询。

3. **环境变量缺失**：如果 `SUPABASE_SERVICE_ROLE_KEY` 未在 Vercel 环境变量中设置，API 路由无法绕过 RLS 策略。

## 解决方案

### 1. 修改代码（已完成）

已修改 `app/services/database/supabase-server.ts` 中的 `createApiSupabaseClient` 函数：
- 优先使用 `SUPABASE_SERVICE_ROLE_KEY`（绕过 RLS）
- 如果没有设置 service role key，则回退到 anon key（向后兼容）

### 2. 配置环境变量（必需）

在 Vercel Dashboard 中设置以下环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**如何获取 Service Role Key：**
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 **Settings** → **API**
4. 在 **Project API keys** 部分，找到 **service_role** key（注意：这是敏感密钥，不要暴露在客户端代码中）
5. 复制该 key 并添加到 Vercel 环境变量中

**重要提示：**
- ✅ 为 **Production**、**Preview** 和 **Development** 环境都设置此变量
- ⚠️ Service Role Key 具有完全访问权限，只能用于服务器端代码
- 🔒 不要将此 key 提交到 Git 仓库或暴露在客户端代码中

### 3. 重新部署

设置环境变量后，需要重新部署：

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 找到最新的部署，点击 **⋯** → **Redeploy**
3. 或者推送新的代码到 GitHub（会自动触发部署）

## 验证修复

部署完成后，验证修复是否成功：

1. **检查环境变量**：访问 `https://your-app.vercel.app/api/check-env`，确认 `SUPABASE_SERVICE_ROLE_KEY` 已设置

2. **测试 API**：尝试生成报告，应该不再出现 "User not found" 错误

3. **查看日志**：在 Vercel Dashboard 的 **Functions** 日志中，应该看到：
   ```
   🔑 使用 Service Role Key 创建 Supabase 客户端（绕过 RLS）
   ```

## 技术细节

### 修改前的问题

```typescript
// 使用 anon key，受 RLS 限制
const supabase = createApiSupabaseClient(request)
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
// ❌ 如果 RLS 策略要求 auth.uid() = id，但 auth.uid() 为 null，查询会失败
```

### 修改后的解决方案

```typescript
// 使用 service role key，绕过 RLS
const supabase = createApiSupabaseClient(request)
// ✅ Service role key 可以绕过所有 RLS 策略，允许查询任何数据
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

## 相关文件

- `app/services/database/supabase-server.ts` - Supabase 客户端创建函数
- `app/api/generate-report-perplexity/route.ts` - 报告生成 API 路由
- `docs/VERCEL_ENV_CHECK.md` - 环境变量检查指南

## 常见问题

### Q: 为什么需要 Service Role Key？

A: Service Role Key 可以绕过 RLS 策略，允许服务器端代码查询和修改任何数据。这对于 API 路由是必需的，因为 API 路由需要验证用户身份并查询用户数据，但可能没有有效的用户会话。

### Q: 使用 Service Role Key 安全吗？

A: 是的，只要：
1. 只在服务器端代码中使用（API 路由、Server Components）
2. 不要暴露在客户端代码中
3. 不要提交到 Git 仓库
4. 只在 Vercel 环境变量中设置

### Q: 如果忘记设置 Service Role Key 会怎样？

A: 代码会回退到使用 anon key，但可能会受到 RLS 策略限制，导致查询失败。建议始终设置 Service Role Key。

## 参考文档

- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Service Role Key](https://supabase.com/docs/guides/api/api-keys)
- [Vercel 环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)

