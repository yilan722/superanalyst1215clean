# Stripe Webhook 配置指南

## 🔧 配置步骤

### 1. 在 Stripe Dashboard 中创建 Webhook

1. **登录 Stripe Dashboard**: https://dashboard.stripe.com/
2. **进入 Webhooks 页面**: Developers → Webhooks
3. **点击 "Add endpoint"**
4. **配置 Webhook**:
   - **Endpoint URL**: `https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app/api/stripe/webhook`
   - **Description**: `TopAnalyst Subscription Webhook`
   - **Events to send**: 选择以下事件：
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 2. 获取 Webhook Secret

创建 webhook 后，你会看到一个 `whsec_...` 开头的 secret。

### 3. 在 Vercel 中设置环境变量

1. **登录 Vercel Dashboard**: https://vercel.com/dashboard
2. **选择项目**: `top-analyst-5`
3. **进入 Settings → Environment Variables**
4. **添加环境变量**:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_your_webhook_secret_here`
   - **Environment**: Production, Preview, Development

### 4. 重新部署应用

设置环境变量后，需要重新部署应用：

```bash
# 在 Vercel Dashboard 中点击 "Redeploy"
# 或者推送代码触发自动部署
git push origin main
```

## 🧪 测试 Webhook

### 1. 检查 Webhook 状态

访问: `https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app/api/test-webhook`

### 2. 检查用户订阅状态

访问: `https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app/api/debug-user-subscription?email=liuyilan72@outlook.com`

### 3. 手动更新用户订阅（如果需要）

```bash
curl -X POST https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app/api/manual-update-subscription \
  -H "Content-Type: application/json" \
  -d '{"email": "liuyilan72@outlook.com", "subscriptionType": "basic"}'
```

## 🔍 故障排除

### 问题 1: Webhook 没有触发
- 检查 webhook URL 是否正确
- 检查环境变量是否设置
- 查看 Stripe Dashboard 中的 webhook 日志

### 问题 2: 用户订阅没有更新
- 检查 webhook 事件是否包含正确的 metadata
- 查看 Vercel 函数日志
- 使用调试 API 检查用户状态

### 问题 3: Customer Email 被覆盖
- 现在使用 Stripe Customer 而不是 customer_email
- Email 信息存储在 metadata 中作为备份

## 📊 监控和日志

### Stripe Dashboard
- 查看 webhook 事件和响应状态
- 检查是否有失败的事件

### Vercel Dashboard
- 查看函数日志
- 监控 webhook 端点的性能

### 应用日志
- 所有 webhook 处理都有详细的 console.log
- 包含 emoji 前缀便于识别
