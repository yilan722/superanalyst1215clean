# Stripe Webhook 事件配置指南

## 🎯 Thin Payload 必需事件

### 核心支付事件
- `checkout.session.completed` - 支付完成
- `checkout.session.expired` - 支付会话过期

### 订阅管理事件  
- `customer.subscription.created` - 订阅创建
- `customer.subscription.updated` - 订阅更新
- `customer.subscription.deleted` - 订阅取消

### 支付状态事件
- `invoice.payment_succeeded` - 支付成功
- `invoice.payment_failed` - 支付失败
- `invoice.payment_action_required` - 需要额外操作

### 客户管理事件
- `customer.created` - 客户创建
- `customer.updated` - 客户更新

## 🔧 在 Stripe Dashboard 中配置

1. **进入 Webhooks 页面**: Developers → Webhooks
2. **编辑现有 thin endpoint** 或创建新的
3. **选择事件**:
   ```
   ✅ checkout.session.completed
   ✅ checkout.session.expired
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ invoice.payment_action_required
   ✅ customer.created
   ✅ customer.updated
   ```

## 📊 事件处理优先级

### 高优先级 (必须)
1. `checkout.session.completed` - 主要支付完成事件
2. `customer.subscription.created` - 订阅创建
3. `invoice.payment_succeeded` - 支付确认

### 中优先级 (重要)
4. `customer.subscription.updated` - 订阅变更
5. `invoice.payment_failed` - 支付失败处理

### 低优先级 (可选)
6. `customer.subscription.deleted` - 订阅取消
7. `checkout.session.expired` - 会话过期
8. `customer.created` - 客户创建
9. `customer.updated` - 客户更新

## 🚨 当前问题诊断

从你的截图看到：
- `brilliant-legacy-thin`: 0% 错误率 ✅
- `brilliant-legacy-snapshot`: 100% 错误率 ❌

**建议**：
1. 删除有问题的 snapshot endpoint
2. 确保 thin endpoint 监听上述事件
3. 验证 webhook URL 正确

## 🧪 测试事件

配置完成后，可以测试：
1. 进行一次测试支付
2. 检查 webhook 日志
3. 验证用户订阅状态更新

## 📝 注意事项

- **Thin payload** 只包含必要数据，适合我们的需求
- **Metadata** 是关键，确保包含 userId 和 planId
- **错误处理** 很重要，记录所有 webhook 调用
- **幂等性** 确保重复事件不会造成问题
