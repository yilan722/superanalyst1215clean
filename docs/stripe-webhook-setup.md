# Stripe Webhook 设置指南

## 使用 Stripe CLI 设置 Webhook

### 1. 安装 Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# 或者下载二进制文件
# https://github.com/stripe/stripe-cli/releases
```

### 2. 登录 Stripe
```bash
stripe login
```

### 3. 创建新的 Webhook
```bash
stripe listen --forward-to https://superanalyst.pro/api/stripe/webhook
```

### 4. 监听特定事件
```bash
stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed --forward-to https://superanalyst.pro/api/stripe/webhook
```

### 5. 获取 Webhook Secret
运行 `stripe listen` 后，会显示类似这样的输出：
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

将这个secret添加到你的环境变量中：
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 在 Stripe Dashboard 中修改现有 Webhook

### 1. 进入 Webhook 设置
- 登录 Stripe Dashboard
- 进入 Developers → Webhooks
- 找到你的 webhook 端点

### 2. 编辑 Webhook
- 点击 webhook 右侧的 "..." 按钮
- 选择 "Edit"

### 3. 修改事件列表
在 "Select events" 部分，确保选择以下事件：

#### 必需事件（订阅功能）
- `checkout.session.completed` - 支付完成
- `customer.subscription.created` - 订阅创建  
- `customer.subscription.updated` - 订阅更新
- `customer.subscription.deleted` - 订阅取消
- `invoice.payment_succeeded` - 发票支付成功
- `invoice.payment_failed` - 发票支付失败

#### 可选事件（增强功能）
- `checkout.session.expired` - 支付会话过期
- `invoice.payment_action_required` - 需要用户操作
- `customer.created` - 客户创建
- `customer.updated` - 客户更新

### 4. 保存更改
- 点击 "Save" 保存设置
- Stripe 会自动重新配置 webhook

## 验证 Webhook 设置

### 1. 测试 Webhook
在 Stripe Dashboard 中：
- 进入你的 webhook 详情页面
- 点击 "Send test webhook"
- 选择要测试的事件类型

### 2. 检查日志
- 查看 Stripe Dashboard 中的 webhook 日志
- 检查你的应用日志（Vercel 部署日志）
- 确认事件被正确接收和处理

## 常见问题

### Q: 如何知道需要监听哪些事件？
A: 查看你的 webhook 处理代码，在 `app/api/stripe/webhook/route.ts` 中：

```typescript
switch (event.type) {
  case 'checkout.session.completed':
    // 处理支付完成
    break
  case 'customer.subscription.created':
    // 处理订阅创建
    break
  // ... 其他事件
}
```

### Q: 可以添加新事件吗？
A: 可以，但需要确保你的代码能处理这些事件。添加新事件后，记得更新 webhook 处理逻辑。

### Q: 如何删除不需要的事件？
A: 在 Stripe Dashboard 中编辑 webhook，取消选择不需要的事件即可。

## 当前推荐的事件配置

基于你的代码，推荐监听以下事件：

```
checkout.session.completed
checkout.session.expired
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
invoice.payment_action_required
customer.created
customer.updated
```

这样可以确保所有订阅相关的功能都能正常工作。
